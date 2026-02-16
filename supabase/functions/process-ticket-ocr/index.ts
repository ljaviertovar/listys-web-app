import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface RequestBody {
  ticketId: string
  imageUrl?: string // Single image (backward compatibility)
  imageUrls?: string[] // Multiple images (new)
}

interface ReceiptItem {
  name: string
  quantity: number | null
  unit: string | null
  price: number | null
  category: string | null
}

// Process a single image with OpenAI Vision API
async function processImage(
  imageUrl: string,
  imageIndex: number,
  totalImages: number
): Promise<ReceiptItem[]> {
  const isMultiImage = totalImages > 1
  const positionContext = isMultiImage
    ? `This is image ${imageIndex + 1} of ${totalImages} of a LONG RECEIPT captured in multiple photos.
       ${imageIndex === 0 ? 'This is the TOP/START of the receipt.' : ''}
       ${imageIndex === totalImages - 1 ? 'This is the BOTTOM/END of the receipt.' : ''}
       ${imageIndex > 0 && imageIndex < totalImages - 1
      ? 'This is a MIDDLE section of the receipt.'
      : ''
    }`
    : ''

  const mergeInstructions = isMultiImage
    ? `IMPORTANT: Since this is part of a multi-image receipt:
       - Items at the edges might be partially visible or cut off
       - If an item appears incomplete (cut text, missing price), still include it
       - The system will merge items from all images and remove duplicates automatically`
    : ''

  // NOTE: output schema MUST match ReceiptItem (name, quantity, unit, price, category)
  const prompt = `You are a receipt line-item extractor.

${positionContext}

GOAL:
Extract a COMPLETE list of purchased products from the image.
Maximize recall, but DO NOT merge different products into one.

Return ONLY valid JSON (no markdown), array with EXACT structure:

[
  {
    "name": "string",
    "category": string | null,
    "quantity": number | null,
    "unit": string | null,
    "price": number | null
  }
]

ABSOLUTE RULES:
- DO NOT deduplicate items. Server will dedupe across images.
- DO NOT combine two different products into one item.
- DO NOT add/sum weights or quantities across products.
- If you are unsure about a field, set it to null (but keep the item).

HOW TO EXTRACT ITEMS (RECALL FIRST):
- Include any product-like line even if abbreviated or slightly misspelled.
- Include product names even if you cannot confidently find a price (price = null).
- Exclude ONLY totals/taxes/payments/store-info: SUBTOTAL, TOTAL, TAX/HST/GST, VISA/MC/DEBIT, CHANGE, BALANCE, DATE/TIME, CASHIER, ADDRESS, THANK YOU.

CATEGORIES:
- Use receipt section headers when present (PRODUCE, GROCERY, DELI, BAKERY, MEAT, BULK, SEAFOOD).
- Otherwise category = null (do not guess too much).

QUANTITY & UNIT (CONSERVATIVE):
- Extract quantity/unit ONLY when explicitly tied to that product:
  - weight patterns: "0.510 kg", "0.425 Kg", "1.25 lb"
  - count patterns: "(2)", "2x", "2 x"
- If you see "x" without a clear number, do NOT set unit to "x". Use null.

PRICE (BEST-EFFORT, NO COMPUTATION):
- Do NOT compute or validate prices.
- If a price is clearly printed on the same line as the product name, extract it.
- If the product name is on one line and the price is on the immediately next line AND it clearly belongs to that same product name, extract it.
- Otherwise set price = null (but include the item).
- Parse "$2.80", "2.80", "2,80" as 2.80.
- Never reuse the same weight value or total price across different produce items unless it is explicitly printed that way.

PRODUCE LINE RULE (CRITICAL):
- If a produce line contains a PLU code (4-6 digits) AND a weight (e.g., "0.425 Kg") AND an "@" unit price AND a final total,
  treat that SINGLE line as a complete item.
- Do NOT swap weights or totals between produce lines.
- Do NOT merge two different produce lines together.


NAME CLEANUP:
- Light cleanup only (trim extra spaces).
- You may correct very obvious OCR typos ONLY when extremely confident (e.g., DIKOS -> OIKOS).
- Do NOT “invent” brands or expand abbreviations aggressively.
- If a name is too unclear (mostly random letters), keep it as-is (do not attempt to expand it).

FINAL CHECK:
- Output ALL items you can identify as products, even if abbreviated and even if price is null.
- JSON only.

${mergeInstructions}
`


  const ocrResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0,
      top_p: 1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        },
      ],
      max_tokens: 5000,
    }),
  })

  if (!ocrResponse.ok) {
    const error = await ocrResponse.text()
    console.error(`OpenAI API error for image ${imageIndex + 1}:`, error)
    throw new Error(`OpenAI API error: ${error}`)
  }

  const ocrData = await ocrResponse.json()
  const content = ocrData.choices[0]?.message?.content || '[]'

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleanContent)

    // Defensive: ensure array
    if (!Array.isArray(parsed)) return []

    // Defensive cleanup: only keep expected fields
    return parsed
      .filter((x: any) => x && typeof x === 'object')
      .map((x: any) => ({
        name: typeof x.name === 'string' ? x.name : '',
        category: x.category ?? null,
        quantity:
          typeof x.quantity === 'number' && Number.isFinite(x.quantity)
            ? x.quantity
            : null,
        unit: typeof x.unit === 'string' ? x.unit : x.unit ?? null,
        price:
          typeof x.price === 'number' && Number.isFinite(x.price) ? x.price : null,
      }))
      .filter((x: ReceiptItem) => x.name.trim().length > 0)
  } catch (parseError) {
    console.error(`Failed to parse OCR response for image ${imageIndex + 1}:`, content)
    throw new Error('Failed to parse OCR response')
  }
}

/**
 * Merge items from multiple images.
 * Deduplicate ONLY likely overlaps: first N items of current image vs last M items of previous merged tail.
 * Conservative policy to avoid deleting legitimate repeated purchases.
 */
function mergeItems(allItems: ReceiptItem[][]): ReceiptItem[] {
  if (allItems.length === 0) return []
  if (allItems.length === 1) return allItems[0]

  const merged: ReceiptItem[] = []
  const BORDER_LOOKBACK = 25 // tail size to compare against
  const BORDER_CHECK_FIRST = 8 // only first items of each next image can be overlap duplicates

  for (let imgIndex = 0; imgIndex < allItems.length; imgIndex++) {
    const imageItems = allItems[imgIndex] ?? []

    for (let itemIndex = 0; itemIndex < imageItems.length; itemIndex++) {
      const item = imageItems[itemIndex]

      const shouldCheckBorder = imgIndex > 0 && itemIndex < BORDER_CHECK_FIRST
      if (!shouldCheckBorder) {
        merged.push(item)
        continue
      }

      const tail = merged.slice(-BORDER_LOOKBACK)
      const isDup = tail.some((prev) => isBorderDuplicate(prev, item))

      if (!isDup) merged.push(item)
      else console.log(`Skipping border duplicate: "${item.name}"`)
    }
  }

  return merged
}

function isBorderDuplicate(a: ReceiptItem, b: ReceiptItem): boolean {
  const aName = normalizeNameForCompare(a.name)
  const bName = normalizeNameForCompare(b.name)
  if (!aName || !bName) return false

  const bothPrices = isFiniteNumber(a.price) && isFiniteNumber(b.price)
  const priceMatch = bothPrices
    ? nearlyEqual(a.price as number, b.price as number, 0.01)
    : false

  const qtyMatch =
    isFiniteNumber(a.quantity) && isFiniteNumber(b.quantity)
      ? nearlyEqual(a.quantity as number, b.quantity as number, 0.001)
      : false

  const unitMatch =
    a.unit && b.unit ? normalizeUnit(a.unit) === normalizeUnit(b.unit) : false

  const tokenSim = tokenJaccard(aName, bName)
  const bigramSim = diceBigrams(aName, bName)

  if (bothPrices) {
    const nameOk = tokenSim >= 0.8 || bigramSim >= 0.88
    return nameOk && priceMatch
  }

  const nameVeryHigh = tokenSim >= 0.92 || bigramSim >= 0.95
  if (!nameVeryHigh) return false

  if (qtyMatch || unitMatch) return true
  return tokenSim >= 0.97 || bigramSim >= 0.97
}

/* ---------------- helpers for border dedupe ---------------- */

function normalizeNameForCompare(name: string): string {
  if (!name) return ''
  let s = name.toLowerCase()

  // common receipt noise tokens
  s = s.replace(/\b(mrj|hrj|mjr|hj|rj)\b/g, ' ')

  // remove PLU codes like 4011, 4046
  s = s.replace(/\b\d{4,6}\b/g, ' ')

  // strip punctuation
  s = s.replace(/[^\p{L}\p{N}]+/gu, ' ')
  s = s.replace(/\s+/g, ' ').trim()

  // small, safe OCR canonicalizations (optional/tune)
  s = s.replace(/\bneilson\b/g, 'nelson')

  return s
}

function tokenJaccard(a: string, b: string): number {
  const A = new Set(a.split(' ').filter(Boolean))
  const B = new Set(b.split(' ').filter(Boolean))
  if (A.size === 0 || B.size === 0) return 0

  let inter = 0
  for (const t of A) if (B.has(t)) inter++

  return inter / (A.size + B.size - inter)
}

function diceBigrams(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (str1.length < 2 || str2.length < 2) return 0

  const bigrams1 = new Map<string, number>()
  for (let i = 0; i < str1.length - 1; i++) {
    const bg = str1.substring(i, i + 2)
    bigrams1.set(bg, (bigrams1.get(bg) ?? 0) + 1)
  }

  let intersection = 0
  let total2 = 0
  for (let i = 0; i < str2.length - 1; i++) {
    const bg = str2.substring(i, i + 2)
    total2++
    const c1 = bigrams1.get(bg) ?? 0
    if (c1 > 0) {
      intersection++
      bigrams1.set(bg, c1 - 1)
    }
  }

  const total1 = Array.from(bigrams1.values()).reduce((acc, v) => acc + v, 0) + intersection
  return (2 * intersection) / (total1 + total2)
}

function nearlyEqual(a: number, b: number, eps: number): boolean {
  return Math.abs(a - b) <= eps
}

function isFiniteNumber(x: any): x is number {
  return typeof x === 'number' && Number.isFinite(x)
}

function normalizeUnit(unit: string): string {
  const u = unit.trim().toLowerCase()
  if (u === 'kgs' || u === 'kg.') return 'kg'
  if (u === 'lbs' || u === 'lb.' || u === 'pounds') return 'lb'
  if (u === 'pcs' || u === 'pc' || u === 'piece' || u === 'pieces') return 'pcs'
  return u
}

/**
 * Convert a category string to Title Case (first letter of each word uppercase),
 * preserving spaces. Examples:
 *  - "PRODUCE FRUITS" -> "Produce Fruits"
 *  - "bakery/deli" -> "Bakery Deli"
 * Returns null for empty/null input.
 */
function toTitleCase(input: string | null): string | null {
  if (!input) return null

  // Normalize: replace non-alphanumeric with spaces, collapse runs
  let cleaned = input.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (!cleaned) return null

  // Strip leading department/aisle numbers (e.g. "27 PRODUCE" -> "PRODUCE")
  cleaned = cleaned.replace(/^\d+\s+/, '')
  if (!cleaned) return null

  const parts = cleaned.split(/\s+/)
  const transformed = parts
    .map((p) => {
      const lower = p.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')

  return transformed || null
}

serve(async (req: Request) => {
  try {
    const { ticketId, imageUrl, imageUrls }: RequestBody = await req.json()

    // Support both single image (backward compatibility) and multiple images
    const urls = imageUrls || (imageUrl ? [imageUrl] : [])

    if (!ticketId || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing ticketId or imageUrl(s)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update ticket status to processing
    await supabase.from('tickets').update({ ocr_status: 'processing' }).eq('id', ticketId)

    console.log(`Processing ${urls.length} image(s) for ticket ${ticketId}`)

    // Process all images sequentially
    const allItemsPerImage: ReceiptItem[][] = []

    for (let i = 0; i < urls.length; i++) {
      console.log(`Processing image ${i + 1}/${urls.length}`)
      const items = await processImage(urls[i], i, urls.length)
      console.log(`Image ${i + 1}: Found ${items.length} items`)
      try {
        console.log(`Image ${i + 1} items: ${JSON.stringify(items, null, 2)}`)
      } catch (_e) {
        console.log(`Image ${i + 1} items: (failed to stringify)`)
      }
      allItemsPerImage.push(items)
    }

    // Merge items from all images, removing border duplicates
    const mergedItems = mergeItems(allItemsPerImage)
    console.log(`Total merged items: ${mergedItems.length}`)
    try {
      console.log(`Merged items: ${JSON.stringify(mergedItems, null, 2)}`)
    } catch (_e) {
      console.log('Merged items: (failed to stringify)')
    }

    // Insert items into database (RESPECT CURRENT SCHEMA)
    if (mergedItems.length > 0) {
      const itemsToInsert = mergedItems.map((item: ReceiptItem) => ({
        ticket_id: ticketId,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || null,
        price: item.price || null,
        category: item.category ? toTitleCase(item.category) : null,
      }))

      const { error: insertError } = await supabase.from('ticket_items').insert(itemsToInsert)

      if (insertError) {
        console.error('Failed to insert items:', insertError)
        throw insertError
      }
    }

    // Update ticket status
    await supabase
      .from('tickets')
      .update({
        ocr_status: 'completed',
        processed_at: new Date().toISOString(),
        total_items: mergedItems.length,
      })
      .eq('id', ticketId)

    return new Response(
      JSON.stringify({
        success: true,
        itemCount: mergedItems.length,
        imagesProcessed: urls.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('OCR processing error:', error)

    return new Response(JSON.stringify({ error: error.message || 'OCR processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
