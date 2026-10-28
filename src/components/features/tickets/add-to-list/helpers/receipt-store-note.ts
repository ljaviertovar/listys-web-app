export function shouldShowReceiptStoreUnconfirmedNote(storeConfirmed: boolean, reviewing: boolean) {
	return !storeConfirmed && !reviewing
}
