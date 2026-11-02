import type { ReceiptTriageSection } from './build-receipt-triage'

export type ReceiptSelectionBreakdown = {
	/** Included lines that will create an item in the list. */
	added: number
	/** Included lines that will update an item the list already has. */
	updated: number
}

/**
 * What adding the included lines will do against the list being compared, from the same matches and decisions the sections
 * show. A proposal nobody confirmed counts as new, because that is what happens to it. `null` while there is no comparison.
 */
export function buildSelectionBreakdown(
	sections: readonly ReceiptTriageSection[],
	selectedIds: ReadonlySet<string>,
): ReceiptSelectionBreakdown | null {
	if (sections.length === 0) return null

	const breakdown: ReceiptSelectionBreakdown = { added: 0, updated: 0 }
	for (const section of sections) {
		for (const line of section.lines) {
			if (!selectedIds.has(line.item.id)) continue
			if (line.target) breakdown.updated += 1
			else breakdown.added += 1
		}
	}
	return breakdown
}
