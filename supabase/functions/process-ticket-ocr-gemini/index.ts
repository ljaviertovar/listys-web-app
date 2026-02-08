import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface RequestBody {
  ticketId: string
  imageUrl?: string
  imageUrls?: string[]
}

interface ReceiptItem {
  name: string
  quantity: number
  unit: string
  price: number | null
  category: string | null
}

/* --- HELPERS DE UTILIDAD --- */

async function getBase64FromUrl(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = base64Encode(new Uint8Array(buffer));
  return { base64, mimeType: blob.type };
}

function toTitleCase(input: string | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!cleaned) return null;
  return cleaned.split(/\s+/).map(p => p.toLowerCase().charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/* --- PROCESAMIENTO DE IMAGEN CON GEMINI 3 FLASH --- */

async function processImage(
  imageUrl: string,
  imageIndex: number,
  totalImages: number
): Promise<ReceiptItem[]> {
  const isMultiImage = totalImages > 1;
  const positionContext = isMultiImage
    ? `Image ${imageIndex + 1} of ${totalImages}. Context: This is a ${imageIndex === 0 ? 'START' : imageIndex === totalImages - 1 ? 'END' : 'MIDDLE'} section of a long receipt.`
    : '';

  const prompt = `You are a professional receipt data extractor using Gemini 3 Agentic Vision.
${positionContext}

GOAL: Extract every product into a JSON array.

STRICT SCHEMA:
[
  {
    "name": "string",
    "category": "string",
    "quantity": number,
    "unit": "string",
    "price": number | null
  }
]

CRITICAL RULES FOR QUANTITY AND UNIT:
1. "quantity" and "unit" MUST NEVER BE NULL.
2. DEFAULTING: If no weight (kg, lb) or count (2x, 5 @) is visible, you MUST use "quantity": 1 and "unit": "unit".
3. "price" is the final total amount for that line.
4. "category" should match receipt headers (e.g., GROCERY, PRODUCE, MEATS).

EXAMPLES:
- "LANTIC Y SUG ... 5.49" -> {"name": "LANTIC Y SUG", "category": "GROCERY", "quantity": 1, "unit": "unit", "price": 5.49}
- "5 @ $0.69 LIME ... 3.45" -> {"name": "LIME", "category": "PRODUCE", "quantity": 5, "unit": "unit", "price": 3.45}
- "0.510 kg @ $5.49/kg TOMATO" -> {"name": "TOMATO", "category": "PRODUCE", "quantity": 0.510, "unit": "kg", "price": 2.80}

Return ONLY the JSON array.`;

  const { base64, mimeType } = await getBase64FromUrl(imageUrl);
  const modelName = 'gemini-3-flash-preview';

  const ocrResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          media_resolution: "MEDIA_RESOLUTION_HIGH"
        },
      }),
    }
  );

  // Log request metadata (do not log large inline data)
  console.log(`Gemini request: imageIndex=${imageIndex + 1}/${totalImages} model=${modelName} mimeType=${mimeType}`);

  if (!ocrResponse.ok) {
    const errText = await ocrResponse.text().catch(() => '<no body>')
    console.error(`Gemini API error for image ${imageIndex + 1}: status=${ocrResponse.status} body=${errText}`)
    throw new Error(`Gemini API error: ${ocrResponse.status}`)
  }

  const ocrData = await ocrResponse.json();
  const content = ocrData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  console.log(`Gemini raw content length: ${String(content).length} for image ${imageIndex + 1}`);

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];

    const mapped = parsed.map((x) => {
      // DOBLE SEGURIDAD: Validamos tipos de datos en JS antes de retornar
      const rawQty = parseFloat(x.quantity);
      return {
        name: typeof x.name === 'string' ? x.name : 'Unknown Item',
        category: x.category || null,
        quantity: isFinite(rawQty) ? rawQty : 1, // Fallback si la IA envía null
        unit: (typeof x.unit === 'string' && x.unit.length > 0) ? x.unit : 'unit', // Fallback a "unit"
        price: typeof x.price === 'number' && isFinite(x.price) ? x.price : null,
      };
    }).filter((x) => x.name.trim().length > 0);

    console.log(`Parsed ${mapped.length} items from image ${imageIndex + 1}`);
    try { console.log(`Image ${imageIndex + 1} items: ${JSON.stringify(mapped.slice(0, 50))}`) } catch (_) { /* ignore stringify errors */ }

    return mapped;
  } catch (parseError) {
    console.error(`Failed to parse OCR for image ${imageIndex + 1}:`, parseError, 'rawContent:', content?.slice?.(0, 200));
    return [];
  }
}

/* --- LÓGICA DE MEZCLA Y DEDUPLICACIÓN (BORDER MERGE) --- */

function mergeItems(allItems: ReceiptItem[][]): ReceiptItem[] {
  if (allItems.length === 0) return [];
  if (allItems.length === 1) return allItems[0];

  const merged: ReceiptItem[] = [];
  const BORDER_LOOKBACK = 25;
  const BORDER_CHECK_FIRST = 8;

  for (let imgIndex = 0; imgIndex < allItems.length; imgIndex++) {
    const imageItems = allItems[imgIndex] ?? [];

    for (let itemIndex = 0; itemIndex < imageItems.length; itemIndex++) {
      const item = imageItems[itemIndex];
      const shouldCheckBorder = imgIndex > 0 && itemIndex < BORDER_CHECK_FIRST;

      if (!shouldCheckBorder) {
        merged.push(item);
        continue;
      }

      const tail = merged.slice(-BORDER_LOOKBACK);
      const isDup = tail.some((prev) => isBorderDuplicate(prev, item));

      if (!isDup) merged.push(item);
      else console.log(`Skipping overlap duplicate: "${item.name}"`);
    }
  }
  return merged;
}

function isBorderDuplicate(a: ReceiptItem, b: ReceiptItem): boolean {
  const aName = normalizeName(a.name);
  const bName = normalizeName(b.name);
  if (!aName || !bName) return false;

  const priceMatch = (isFinite(a.price!) && isFinite(b.price!))
    ? Math.abs(a.price! - b.price!) <= 0.01 : false;

  const tokenSim = tokenJaccard(aName, bName);
  return tokenSim >= 0.85 && priceMatch;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

function tokenJaccard(a: string, b: string): number {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

/* --- SERVIDOR HTTP --- */

serve(async (req) => {
  try {
    const { ticketId, imageUrl, imageUrls }: RequestBody = await req.json();
    const urls = imageUrls || (imageUrl ? [imageUrl] : []);

    if (!ticketId || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('tickets').update({ ocr_status: 'processing' }).eq('id', ticketId);

    const allItemsPerImage: ReceiptItem[][] = [];
    for (let i = 0; i < urls.length; i++) {
      console.log(`Processing image ${i + 1}/${urls.length} - url=${urls[i]}`);
      try {
        const items = await processImage(urls[i], i, urls.length);
        console.log(`Image ${i + 1}: Found ${items.length} items`);
        try { console.log(`Image ${i + 1} items (preview): ${JSON.stringify(items.slice(0, 50))}`) } catch (_) { }
        allItemsPerImage.push(items);
      } catch (imgErr) {
        console.error(`Error processing image ${i + 1}:`, imgErr);
        allItemsPerImage.push([]);
      }
    }

    const mergedItems = mergeItems(allItemsPerImage);
    console.log(`Total merged items: ${mergedItems.length}`);
    try { console.log(`Merged items preview: ${JSON.stringify(mergedItems.slice(0, 200))}`) } catch (_) { }

    if (mergedItems.length > 0) {
      const itemsToInsert = mergedItems.map(item => ({
        ticket_id: ticketId,
        name: item.name,
        quantity: item.quantity, // Nunca será null gracias al map en processImage
        unit: item.unit,         // Nunca será null
        price: item.price,
        category: toTitleCase(item.category),
      }));

      console.log(`Inserting ${itemsToInsert.length} ticket_items into DB for ticket ${ticketId}`);

      const { error: insertError } = await supabase.from('ticket_items').insert(itemsToInsert);
      if (insertError) {
        console.error('Failed to insert items:', insertError);
        throw insertError;
      }
    }

    await supabase.from('tickets').update({
      ocr_status: 'completed',
      processed_at: new Date().toISOString(),
      total_items: mergedItems.length,
    }).eq('id', ticketId);

    return new Response(JSON.stringify({ success: true, count: mergedItems.length }), { status: 200 });

  } catch (error: any) {
    console.error('Fatal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});