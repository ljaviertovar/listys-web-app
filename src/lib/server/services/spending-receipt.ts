type ReceiptLineForSpending = { price: number | null; quantity: number | null }

/** A total is useful for spending only when OCR returned priced lines that substantially support it. */
export function isSpendableReceipt(ocrStatus: string, total: number | null, lines: ReceiptLineForSpending[]): boolean {
	if (ocrStatus !== 'completed' || typeof total !== 'number' || !Number.isFinite(total) || total < 0) return false
	const pricedLines = lines.filter(line => typeof line.price === 'number' && Number.isFinite(line.price) && line.price >= 0)
	if (pricedLines.length === 0) return false
	const itemTotal = pricedLines.reduce((sum, line) => {
		const quantity = typeof line.quantity === 'number' && Number.isFinite(line.quantity) && line.quantity > 0 ? line.quantity : 1
		return sum + (line.price as number) * quantity
	}, 0)
	const difference = Math.abs(total - itemTotal)
	return difference <= Math.max(10, total * 0.15)
}
