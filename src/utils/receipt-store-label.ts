export const UNRECOGNIZED_STORE_LABEL = 'Store not recognized'

/**
 * The title of a receipt everywhere it appears: the store the user confirmed, otherwise the name read from the receipt (or
 * typed on an older upload), otherwise "Store not recognized". Renaming a store therefore renames all its receipts.
 */
export function getReceiptStoreLabel(receipt: { store?: { name: string } | null; store_name?: string | null }): string {
  return receipt.store?.name.trim() || receipt.store_name?.trim() || UNRECOGNIZED_STORE_LABEL
}
