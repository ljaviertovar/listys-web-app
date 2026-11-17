import { suggestStoreName } from './suggest-store-name'

const UNNAMED_RECEIPT_NAME = 'Unnamed Receipt'

/**
 * The name of a receipt everywhere it appears: "<store> Receipt", where the store is the one the user confirmed, otherwise the
 * name read from the receipt (or typed on an older upload) without its branch number, and "Unnamed Receipt" when there is neither.
 * "Receipt" is only a visual suffix, so renaming a store renames all its receipts and no filter should match on it.
 */
export function getReceiptName(receipt: { store?: { name: string } | null; store_name?: string | null }): string {
  const store = receipt.store?.name.trim() || suggestStoreName(receipt.store_name?.trim())
  return store ? `${store} Receipt` : UNNAMED_RECEIPT_NAME
}
