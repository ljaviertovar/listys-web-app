/**
 * How many more photos a receipt can take, and which of the incoming files fit. Device photos and scanned parts count the same:
 * the form asks this once per batch, before any file is decoded.
 */
export function admitFiles<T>(incoming: readonly T[], current: number, max: number) {
	const slots = Math.max(0, max - current)
	return {
		slots,
		admitted: incoming.slice(0, slots),
		dropped: Math.max(0, incoming.length - slots),
	}
}
