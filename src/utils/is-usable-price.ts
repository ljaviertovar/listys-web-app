/** A price worth showing or adding up: a finite number above zero. Missing, zero, negative or non-numeric means "no data". */
export function isUsablePrice(price: number | null | undefined): price is number {
	return typeof price === 'number' && Number.isFinite(price) && price > 0
}
