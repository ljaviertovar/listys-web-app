/** A store as `/api/v1/stores` returns it (see `StoreDto` in the stores service). */
export type Store = {
  id: string
  name: string
  receipt_count: number
  created_at: string
  updated_at: string
	last_visit: { kind: 'trip' | 'receipt'; id: string; at: string; total_amount: number | null } | null
	/** Base-list items whose usual store this is; the list read includes it, other store reads may leave it out. */
	usual_items_count?: number
}

/** One name the store answers to on receipts. The canonical name (the store's own) cannot be removed. */
export type StoreReceiptName = { id: string; name: string; removable: boolean }

/** A store with what its detail screen shows: spend since the start of the year and the names printed on its receipts. */
export type StoreDetail = Store & {
	spent_since: string
	spent_total: number
	names: StoreReceiptName[]
}

/** The store a receipt is confirmed at, as embedded in receipt reads. */
export type StoreRef = {
  id: string
  name: string
}
