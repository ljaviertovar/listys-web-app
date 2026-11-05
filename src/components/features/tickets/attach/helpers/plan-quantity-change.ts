export type ReviewSessionItem = { id: string; name: string; checked: boolean; quantity?: number | null; unit?: string | null }
type QuantityLine = { quantity?: number | null; unit?: string | null }

/** Mirrors the RPC: quantities replace the usual quantity only when every contributing line uses the same unit. */
export function planQuantityChange(item: ReviewSessionItem, lines: QuantityLine[]): { before: number; after: number } | null {
	if (!lines.length) return null
	const units = new Set(lines.map(line => line.unit?.trim().toLowerCase() || 'each'))
	if (units.size !== 1) return null
	const before = item.quantity ?? 1
	const after = lines.reduce((sum, line) => sum + (line.quantity ?? 1), 0)
	return before === after ? null : { before, after }
}
