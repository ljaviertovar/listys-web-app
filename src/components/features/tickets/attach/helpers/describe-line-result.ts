import { formatItemName } from '@/utils'

import { hasReadableName, type LineDecision } from './line-decision'
import type { ReviewReceiptLine } from './read-ticket-for-review'
import type { ReviewSessionItem } from './plan-quantity-change'

export type ReviewLineTag = 'Remembered' | 'Linked by you' | 'No price' | 'No name'

export function describeLineResult({ line, decision, item, origin, quantityChange }: {
	line: ReviewReceiptLine
	decision: LineDecision
	item?: ReviewSessionItem | null
	origin?: 'name' | 'alias' | 'user' | 'none'
	quantityChange?: { before: number; after: number } | null
}): { tag: ReviewLineTag | null; result: string; canChange: boolean } {
	if (!hasReadableName(line)) return { tag: 'No name', result: 'The name couldn’t be read, so it can’t be added.', canChange: false }
	if (decision.kind === 'leave') return { tag: null, result: 'Left out by you', canChange: true }
	const tag = line.price == null ? 'No price' : origin === 'user' ? 'Linked by you' : origin === 'alias' ? 'Remembered' : null
	if (decision.kind === 'add') return { tag, result: 'Adds as a new item', canChange: true }
	const parts = [`Matches ${formatItemName(item?.name ?? line.name)}`]
	if (quantityChange) parts.push(`usual quantity ${quantityChange.before} → ${quantityChange.after}`)
	if (origin === 'alias') parts.push('from an earlier receipt')
	if (origin === 'user') parts.push('remembered for next time')
	if (line.price == null && !item?.checked) parts.push('checked off without a price')
	return { tag, result: parts.join(' · '), canChange: true }
}
