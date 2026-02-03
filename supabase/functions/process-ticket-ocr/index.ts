import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface RequestBody {
  ticketId: string
  imageUrl?: string      // Single image (backward compatibility)
  imageUrls?: string[]   // Multiple images (new)
}

interface ReceiptItem {
  name: string
  quantity: number
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
       ${imageIndex > 0 && imageIndex < totalImages - 1 ? 'This is a MIDDLE section of the receipt.' : ''}`
    : ''

  const mergeInstructions = isMultiImage
    ? `IMPORTANT: Since this is part of a multi-image receipt:
       - Items at the edges might be partially visible or cut off
       - If an item appears incomplete (cut text, missing price), still include it
       - The system will merge items from all images and remove duplicates automatically`
    : ''

  const prompt = `Extract all items from this grocery receipt/ticket.
${positionContext}

Return ONLY a valid JSON array with this exact structure, no markdown formatting:

[
  {
    "name": "Product name",
    "quantity": 2,
    "unit": "kg" | "pcs" | "lbs" | null,
    "price": 5.99,
    "category": "Produce" | "Dairy" | "Meat" | "Seafood" | "Bakery" | "Pantry" | "Frozen" | "Beverages" | "Snacks" | "Health & Beauty" | "Household" | "Other"
  }
]

Rules:
- Normalize item names (capitalize properly, remove extra spaces)
- Infer units if not explicitly shown
- The "price" field must be the UNIT PRICE (price per single item), NOT the total line price
- If the receipt shows a total for multiple items (e.g., "3 x $2.50 = $7.50"), extract price as 2.50, not 7.50
- Ignore subtotals, taxes, payment info, and totals
- Only return the JSON array, no additional text or markdown
- If you can't extract items, return an empty array []
${mergeInstructions}`

  const ocrResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 3000,
    }),
  })

  if (!ocrResponse.ok) {
    const error = await ocrResponse.text()
    console.error(`OpenAI API error for image ${imageIndex + 1}:`, error)
    throw new Error(`OpenAI API error: ${error}`)
  }

  const ocrData = await ocrResponse.json()
  const content = ocrData.choices[0]?.message?.content || '[]'

  // Parse the response
  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanContent)
  } catch (parseError) {
    console.error(`Failed to parse OCR response for image ${imageIndex + 1}:`, content)
    throw new Error('Failed to parse OCR response')
  }
}

// Merge items from multiple images, removing duplicates at borders
function mergeItems(allItems: ReceiptItem[][]): ReceiptItem[] {
  if (allItems.length === 0) return []
  if (allItems.length === 1) return allItems[0]

  const merged: ReceiptItem[] = []

  for (let imgIndex = 0; imgIndex < allItems.length; imgIndex++) {
    const imageItems = allItems[imgIndex]

    for (let itemIndex = 0; itemIndex < imageItems.length; itemIndex++) {
      const item = imageItems[itemIndex]

      // Check if this item might be a duplicate from the border
      // Compare with items at the end of merged list (from previous image)
      const isDuplicate = imgIndex > 0 && itemIndex < 3 && // First 3 items of each new image
        merged.slice(-5).some(mergedItem => { // Compare with last 5 items
          const nameSimilarity = calculateSimilarity(
            item.name.toLowerCase(),
            mergedItem.name.toLowerCase()
          )
          // Consider duplicate if names are >70% similar and prices match (or both null)
          const priceMatch = item.price === mergedItem.price ||
            (item.price === null || mergedItem.price === null)
          return nameSimilarity > 0.7 && priceMatch
        })

      if (!isDuplicate) {
        merged.push(item)
      } else {
        console.log(`Skipping duplicate item: ${item.name}`)
      }
    }
  }

  return merged
}

// Simple string similarity calculation (Dice coefficient)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (str1.length < 2 || str2.length < 2) return 0

  const bigrams1 = new Set<string>()
  const bigrams2 = new Set<string>()

  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2))
  }
  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2))
  }

  let intersection = 0
  bigrams1.forEach(bigram => {
    if (bigrams2.has(bigram)) intersection++
  })

  return (2 * intersection) / (bigrams1.size + bigrams2.size)
}

serve(async (req) => {
  try {
    const { ticketId, imageUrl, imageUrls }: RequestBody = await req.json()

    // Support both single image (backward compatibility) and multiple images
    const urls = imageUrls || (imageUrl ? [imageUrl] : [])

    if (!ticketId || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing ticketId or imageUrl(s)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update ticket status to processing
    await supabase
      .from('tickets')
      .update({ ocr_status: 'processing' })
      .eq('id', ticketId)

    console.log(`Processing ${urls.length} image(s) for ticket ${ticketId}`)

    // Process all images sequentially
    const allItemsPerImage: ReceiptItem[][] = []

    for (let i = 0; i < urls.length; i++) {
      console.log(`Processing image ${i + 1}/${urls.length}`)
      const items = await processImage(urls[i], i, urls.length)
      console.log(`Image ${i + 1}: Found ${items.length} items`)
      allItemsPerImage.push(items)
    }

    // Merge items from all images, removing border duplicates
    const mergedItems = mergeItems(allItemsPerImage)
    console.log(`Total merged items: ${mergedItems.length}`)

    // Insert items into database
    if (mergedItems.length > 0) {
      const itemsToInsert = mergedItems.map((item: ReceiptItem) => ({
        ticket_id: ticketId,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || null,
        price: item.price || null,
        category: item.category || null,
      }))

      const { error: insertError } = await supabase
        .from('ticket_items')
        .insert(itemsToInsert)

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

    // Try to update ticket status to failed with error details
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const errorMessage = error.message || 'OCR processing failed'

      // Try to get ticketId from the request
      // Note: We can't re-read the body, so we need to handle this gracefully
      // The API route should handle marking as failed if this fails

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (updateError) {
      console.error('Failed to update ticket status:', updateError)
    }

    return new Response(
      JSON.stringify({ error: error.message || 'OCR processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
