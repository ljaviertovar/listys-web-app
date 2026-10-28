// Shared by the OCR Edge Functions. Plain TypeScript with no Deno or network imports, so Vitest can test it too.

export const MAX_STORE_NAME_LENGTH = 100
export const MAX_RECEIPT_TOTAL = 2

export interface OcrPayload<T> {
  items: T[]
  storeName: string | null
  total: number | null
}

/** A malformed or absent printed total must never make item extraction fail. */
export function sanitizeReceiptTotal(raw: unknown): number | null {
  if (typeof raw !== 'number' && typeof raw !== 'string') return null

  const normalized = typeof raw === 'string' ? raw.trim().replace(',', '.') : raw
  if (normalized === '') return null

  const value = typeof normalized === 'number' ? normalized : Number(normalized)
  if (!Number.isFinite(value) || value < 0) return null

  return Number(value.toFixed(MAX_RECEIPT_TOTAL))
}

/**
 * Cleans the store name the model read from the receipt header: one line, single spaces, no control characters, at most
 * 100 characters. Anything that is not a non-empty string becomes `null`, so a bad store name can never fail a receipt.
 */
export function sanitizeStoreName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null

  const cleaned = raw
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_STORE_NAME_LENGTH)
    .trim()

  return cleaned.length > 0 ? cleaned : null
}

/**
 * Reads the model's JSON answer in either shape: the item array every photo used to return, or the
 * `{ "store_name": ..., "total": ..., "items": [...] }` object. Throws only when the text is not JSON at all, exactly
 * as each function did before; unexpected optional fields become null.
 */
export function parseOcrPayload(content: string): OcrPayload<unknown> {
  const parsed: unknown = JSON.parse(content)

  if (Array.isArray(parsed)) {
    return { items: parsed, storeName: null, total: null }
  }

  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>
    return {
      items: Array.isArray(record.items) ? record.items : [],
      storeName: sanitizeStoreName(record.store_name),
      total: sanitizeReceiptTotal(record.total),
    }
  }

  return { items: [], storeName: null, total: null }
}

/** The first photo carries the header; later photos keep the item-only prompt and its array answer. */
export const STORE_NAME_INSTRUCTIONS = `This photo shows the TOP of the receipt. Also read the store (merchant) name printed in the header.
Return ONLY a JSON object (no markdown) with EXACT structure:
{ "store_name": string | null, "items": [ ...the item objects described below... ] }
STORE NAME RULES:
- Use the business name as printed at the top (e.g. "NO FRILLS", "Walmart Supercentre").
- Do NOT include the address, phone number, website, cashier, register or transaction numbers.
- If no store name is clearly printed, set "store_name" to null. Never guess it from the products.`

export const TOTAL_INSTRUCTIONS = `This photo shows the BOTTOM/LAST section of the receipt. Also read the final total paid printed on the receipt.
Return the printed final total in the "total" field of the JSON object. Do not use subtotal, tax, tendered amount, change, or a sum of item lines. If the final total is not clearly printed, return null. Never guess.`

export const STORE_AND_TOTAL_INSTRUCTIONS = `${STORE_NAME_INSTRUCTIONS}\n\n${TOTAL_INSTRUCTIONS}`
