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
  const cleaned = input.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return cleaned.split(/\s+/).map(p => p.toLowerCase().charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/* --- PROCESAMIENTO OPTIMIZADO CON GEMINI 3 --- */

async function processImage(
  imageUrl: string,
  imageIndex: number,
  totalImages: number
): Promise<ReceiptItem[]> {
  const positionContext = totalImages > 1
    ? `Image ${imageIndex + 1}/${totalImages}. Section: ${imageIndex === 0 ? 'START' : imageIndex === totalImages - 1 ? 'END' : 'MIDDLE'}.`
    : '';

  const prompt = `You are a strict receipt extractor. Extract every product into a JSON array.
  RULES: Never use null for quantity/unit (default to 1 and "unit").
  SCHEMA: [{"name": "string", "category": "string", "quantity": number, "unit": "string", "price": number|null}]
  ${positionContext}`;

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
    const parsed = JSON.parse(content);
    console.log('[DEBUG] JSON parsed successfully, array?', Array.isArray(parsed), 'length:', Array.isArray(parsed) ? parsed.length : 'N/A');
    const mapped = (Array.isArray(parsed) ? parsed : []).map(x => ({
      name: String(x.name || 'Unknown'),
      category: x.category || null,
      quantity: isFinite(parseFloat(x.quantity)) ? parseFloat(x.quantity) : 1,
      unit: x.unit ? String(x.unit) : 'unit',
      price: typeof x.price === 'number' ? x.price : null,
    }));
    console.log(`[DEBUG] Mapped ${mapped.length} items from image ${imageIndex + 1}`);
    return mapped;
  } catch (parseError) {
    console.error('[ERROR] JSON parse failed:', parseError, 'Content:', content.slice(0, 300));
    return [];
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

    // Marcar como procesando e incrementar intentos
    console.log('[DEBUG] Fetching current ticket state...');
    const { data: ticket } = await supabase.from('tickets').select('ocr_attempts').eq('id', ticketId).single();
    console.log('[DEBUG] Current ocr_attempts:', ticket?.ocr_attempts || 0);
    const { error: updateError } = await supabase.from('tickets').update({
      ocr_status: 'processing',
      ocr_attempts: (ticket?.ocr_attempts || 0) + 1
    }).eq('id', ticketId);

    if (updateError) {
      console.error('[ERROR] Failed to update ticket to processing:', updateError);
      throw updateError;
    }
    console.log('[DEBUG] Ticket status updated to processing');

    // PROCESAMIENTO EN PARALELO (Mucho más rápido)
    console.log('[INFO] Starting parallel image processing...');
    const allResults = await Promise.all(
      urls.map((url, i) => processImage(url, i, urls.length).catch(e => {
        console.error(`[ERROR] Error en imagen ${i + 1}/${urls.length}:`, e);
        return [];
      }))
    );

    console.log('[DEBUG] All images processed. Results:', allResults.map(r => r.length));
    const mergedItems = mergeItems(allResults);
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
      ocr_error: null
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