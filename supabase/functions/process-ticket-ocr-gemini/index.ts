import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
import { parseOcrPayload, STORE_NAME_INSTRUCTIONS } from '../_shared/receipt-store.ts'

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

interface ImageResult {
  items: ReceiptItem[]
  storeName: string | null
}

/* --- HELPERS --- */

async function getBase64FromUrl(url: string): Promise<{ base64: string; mimeType: string }> {
  console.log('[DEBUG] Fetching image from URL:', url.slice(0, 100) + '...');
  const response = await fetch(url);
  if (!response.ok) {
    console.error('[ERROR] Failed to fetch image:', response.status, response.statusText);
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const blob = await response.blob();
  console.log('[DEBUG] Image blob size:', blob.size, 'bytes, type:', blob.type);
  const buffer = await blob.arrayBuffer();
  const base64 = base64Encode(new Uint8Array(buffer));
  console.log('[DEBUG] Base64 encoded, length:', base64.length);
  return {
    base64,
    mimeType: blob.type
  };
}

function toTitleCase(input: string | null): string | null {
  if (!input) return null;
  let cleaned = input.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!cleaned) return null;
  // Strip leading department/aisle numbers (e.g. "27 PRODUCE" -> "PRODUCE")
  cleaned = cleaned.replace(/^\d+\s+/, '');
  if (!cleaned) return null;
  return cleaned.split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

/* --- PROCESAMIENTO OPTIMIZADO CON GEMINI 3 --- */

async function processImage(
  imageUrl: string,
  imageIndex: number,
  totalImages: number
): Promise<ImageResult> {
  const positionContext = totalImages > 1
    ? `Image ${imageIndex + 1}/${totalImages}. Section: ${imageIndex === 0 ? 'START' : imageIndex === totalImages - 1 ? 'END' : 'MIDDLE'}.`
    : '';

  // The store name comes from the same request as the items: only the first photo, which carries the header, asks for it.
  const storeInstructions = imageIndex === 0 ? STORE_NAME_INSTRUCTIONS : '';

  const prompt = `You are a strict receipt extractor. Extract every product into a JSON array.
  RULES: Never use null for quantity/unit (default to 1 and "unit").
  SCHEMA: [{"name": "string", "category": "string", "quantity": number, "unit": "string", "price": number|null}]
  ${positionContext}
  ${storeInstructions}`;

  console.log(`[DEBUG] Processing image ${imageIndex + 1}/${totalImages}`);
  const { base64, mimeType } = await getBase64FromUrl(imageUrl);

  console.log('[DEBUG] Sending request to Gemini API...');
  const ocrResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }]
        }],
        generationConfig: {
          temperature: 0,
          response_mime_type: "application/json", // Fuerza JSON puro
          media_resolution: "MEDIA_RESOLUTION_HIGH"
        },
      }),
    }
  );

  if (!ocrResponse.ok) {
    const errorText = await ocrResponse.text().catch(() => 'Unable to read error');
    console.error(`[ERROR] Gemini API error ${ocrResponse.status}:`, errorText);
    throw new Error(`Gemini Error: ${ocrResponse.status}`);
  }

  const ocrData = await ocrResponse.json();
  console.log('[DEBUG] Gemini response received:', JSON.stringify(ocrData).slice(0, 500) + '...');
  const content = ocrData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  console.log('[DEBUG] Extracted content length:', content.length, 'Preview:', content.slice(0, 200));

  try {
    const { items: parsed, storeName } = parseOcrPayload(content);
    console.log('[DEBUG] JSON parsed successfully, items:', parsed.length, 'store name found:', storeName !== null);
    const mapped = (parsed as Array<Record<string, unknown> | null>).map(x => ({
      name: String(x?.name || 'Unknown'),
      category: typeof x?.category === 'string' && x.category ? x.category : null,
      quantity: isFinite(parseFloat(String(x?.quantity))) ? parseFloat(String(x?.quantity)) : 1,
      unit: x?.unit ? String(x.unit) : 'unit',
      price: typeof x?.price === 'number' ? x.price : null,
    }));
    console.log(`[DEBUG] Mapped ${mapped.length} items from image ${imageIndex + 1}`);
    return { items: mapped, storeName };
  } catch (parseError) {
    console.error('[ERROR] JSON parse failed:', parseError, 'Content:', content.slice(0, 300));
    return { items: [], storeName: null };
  }
}

/* --- MERGE LOGIC --- */

function mergeItems(allItems: ReceiptItem[][]): ReceiptItem[] {
  const merged: ReceiptItem[] = [];
  const flat = allItems.flat();
  const seen = new Set();

  for (const item of flat) {
    const id = `${item.name.toLowerCase().replace(/\s/g, '')}-${item.price}`;
    if (!seen.has(id)) {
      merged.push(item);
      seen.add(id);
    }
  }
  return merged;
}

/* --- SERVIDOR --- */

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let ticketId: string | undefined;

  try {
    const body: RequestBody = await req.json();
    ticketId = body.ticketId;
    const urls = body.imageUrls || (body.imageUrl ? [body.imageUrl] : []);

    console.log('[INFO] OCR request started - Ticket ID:', ticketId, 'Images:', urls.length);

    if (!ticketId || urls.length === 0) {
      console.error('[ERROR] Missing required data - ticketId:', ticketId, 'urls:', urls.length);
      return new Response("Missing data", { status: 400 });
    }

    const startedAt = Date.now();

    // Check current OCR attempts and enforce max limit
    console.log('[DEBUG] Fetching current ticket state...');
    const { data: ticket } = await supabase.from('tickets').select('ocr_attempts, store_name').eq('id', ticketId).single();
    const currentAttempts = ticket?.ocr_attempts || 0;
    const MAX_OCR_ATTEMPTS = 3;

    console.log('[DEBUG] Current ocr_attempts:', currentAttempts);

    // Check if max attempts exceeded
    if (currentAttempts >= MAX_OCR_ATTEMPTS) {
      console.error('[ERROR] Max OCR attempts exceeded:', currentAttempts, '>=', MAX_OCR_ATTEMPTS);
      await supabase.from('tickets').update({
        ocr_status: 'failed',
        ocr_error: `Maximum OCR retry attempts (${currentAttempts}/${MAX_OCR_ATTEMPTS}) exceeded. Please delete this receipt and try uploading again with a clearer image.`
      }).eq('id', ticketId);

      return new Response(
        JSON.stringify({
          error: 'Max OCR attempts exceeded',
          attempts: currentAttempts,
          max: MAX_OCR_ATTEMPTS
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mark as processing and increment attempts
    const { error: updateError } = await supabase.from('tickets').update({
      ocr_status: 'processing',
      ocr_attempts: currentAttempts + 1
    }).eq('id', ticketId);

    if (updateError) {
      console.error('[ERROR] Failed to update ticket to processing:', updateError);
      throw updateError;
    }
    console.log('[DEBUG] Ticket status updated to processing, attempt:', currentAttempts + 1);

    // PROCESAMIENTO EN PARALELO (Mucho más rápido)
    console.log('[INFO] Starting parallel image processing...');
    const allResults = await Promise.all(
      urls.map((url, i) => processImage(url, i, urls.length).catch((e): ImageResult => {
        console.error(`[ERROR] Error en imagen ${i + 1}/${urls.length}:`, e);
        return { items: [], storeName: null };
      }))
    );

    console.log('[DEBUG] All images processed. Results:', allResults.map(r => r.items.length));
    const mergedItems = mergeItems(allResults.map(r => r.items));
    // A name the ticket already has (sent by a client or read earlier) is never overwritten.
    const extractedStoreName = ticket?.store_name ? null : allResults[0]?.storeName ?? null;
    console.log('[INFO] Merged items count:', mergedItems.length);

    if (mergedItems.length > 0) {
      const rows = mergedItems.map(item => ({
        ticket_id: ticketId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        category: toTitleCase(item.category),
      }));
      console.log('[DEBUG] Inserting', rows.length, 'items into ticket_items...');
      const { error: insErr } = await supabase.from('ticket_items').insert(rows);
      if (insErr) {
        console.error('[ERROR] Failed to insert items:', insErr);
        throw insErr;
      }
      console.log('[DEBUG] Items inserted successfully');
    } else {
      console.log('[WARN] No items to insert');
    }

    // Actualización final
    console.log('[DEBUG] Updating ticket to completed...');
    const { error: updErr } = await supabase.from('tickets').update({
      ocr_status: 'completed',
      processed_at: new Date().toISOString(),
      total_items: mergedItems.length,
      ocr_error: null,
      ...(extractedStoreName ? { store_name: extractedStoreName } : {}),
    }).eq('id', ticketId);

    if (updErr) {
      console.error('[ERROR] Failed to update ticket to completed:', updErr);
      throw updErr;
    }

    const elapsedMs = Date.now() - startedAt;
    console.log(`[SUCCESS] OCR Finalizado en ${elapsedMs}ms - Items: ${mergedItems.length}`);

    return new Response(JSON.stringify({ success: true, count: mergedItems.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error('[FATAL] Fatal Error:', error);
    console.error('[FATAL] Error stack:', error.stack);
    console.error('[FATAL] Error details:', JSON.stringify(error, null, 2));

    if (ticketId) {
      console.log('[DEBUG] Updating ticket to failed state...');
      const { error: failError } = await supabase.from('tickets').update({
        ocr_status: 'failed',
        ocr_error: error.message || String(error)
      }).eq('id', ticketId);

      if (failError) {
        console.error('[ERROR] Failed to update ticket to failed state:', failError);
      } else {
        console.log('[DEBUG] Ticket marked as failed');
      }
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});