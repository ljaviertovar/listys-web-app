import type { ChoiceOption } from '@/components/commons'
import type { AvailableReceipt } from '@/lib/api/endpoints'
import { formatCurrency, formatDate } from '@/utils'

const REASON_NOTES: Record<NonNullable<AvailableReceipt['reason']>, string> = {
	STORE_MISMATCH: 'Confirmed at a different store than this trip',
}

/**
 * One uploaded receipt as a row of the chooser: the store and date tell receipts apart, the total and line count say what is
 * on it, and a receipt that cannot be used says why instead of just being greyed out.
 */
export function toReceiptChoice(receipt: AvailableReceipt): ChoiceOption {
	const when = receipt.created_at ? formatDate(new Date(receipt.created_at)) : null
	const lines = `${receipt.item_count} ${receipt.item_count === 1 ? 'line' : 'lines'}`
	const facts = [when, lines].filter(Boolean).join(' · ')

	return {
		value: receipt.id,
		label: receipt.store?.name ?? 'Store not confirmed',
		note: receipt.reason ? `${facts} · ${REASON_NOTES[receipt.reason]}` : facts,
		detail: receipt.total_amount === null ? undefined : formatCurrency(receipt.total_amount),
		disabled: !receipt.selectable,
	}
}
