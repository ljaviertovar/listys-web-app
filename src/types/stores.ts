/** A store as `/api/v1/stores` returns it (see `StoreDto` in the stores service). */
export type Store = {
  id: string
  name: string
  receipt_count: number
  created_at: string
  updated_at: string
	last_visit: { kind: 'trip' | 'receipt'; id: string; at: string; total_amount: number | null } | null
}

/** The store a receipt is confirmed at, as embedded in receipt reads. */
export type StoreRef = {
  id: string
  name: string
}
