export function hasRecordedReceiptTotal(total: number | null): boolean {
	return typeof total === 'number' && Number.isFinite(total) && total >= 0
}

export function isStandaloneReceipt(receipt: {
	shopping_session_id?: string | null
	uploaded_from_session_id?: string | null
}): boolean {
	return !receipt.shopping_session_id && !receipt.uploaded_from_session_id
}
