import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { AvailableReceipt } from '@/lib/api/endpoints'

import { ChooseReceiptContent } from '../choose-uploaded-receipt-sheet'
import { toReceiptChoice } from '../helpers/to-receipt-choice'

const receipt = (overrides: Partial<AvailableReceipt> = {}): AvailableReceipt => ({
	id: 'r1',
	created_at: '2026-11-02T12:00:00Z',
	store: { id: 's1', name: 'Metro' },
	total_amount: 42.5,
	item_count: 7,
	selectable: true,
	reason: null,
	...overrides,
})

const render = (state: Parameters<typeof ChooseReceiptContent>[0]['state']) =>
	renderToStaticMarkup(
		createElement(ChooseReceiptContent, { state, onRetry: vi.fn(), onCancel: vi.fn(), onChoose: vi.fn(), onUploadNew: vi.fn() }),
	)

describe('toReceiptChoice', () => {
	it('tells receipts apart by store, date, lines and total', () => {
		const choice = toReceiptChoice(receipt())
		expect(choice).toMatchObject({ value: 'r1', label: 'Metro', detail: '$42.50', disabled: false })
		expect(choice.note).toContain('7 lines')
	})

	it('says "1 line" and copes with a receipt without a confirmed store or total', () => {
		const choice = toReceiptChoice(receipt({ store: null, total_amount: null, item_count: 1 }))
		expect(choice.label).toBe('Store not confirmed')
		expect(choice.detail).toBeUndefined()
		expect(choice.note).toContain('1 line')
		expect(choice.note).not.toContain('1 lines')
	})

	it('disables a receipt from another store and says why', () => {
		const choice = toReceiptChoice(receipt({ selectable: false, reason: 'STORE_MISMATCH' }))
		expect(choice.disabled).toBe(true)
		expect(choice.note).toContain('different store')
	})
})

describe('the chooser states', () => {
	it('lists selectable and disabled receipts, with Review Receipt waiting for a choice', () => {
		const html = render({
			status: 'ready',
			receipts: [receipt(), receipt({ id: 'r2', store: { id: 's2', name: 'Costco' }, selectable: false, reason: 'STORE_MISMATCH' })],
		})
		expect(html).toContain('Metro')
		expect(html).toContain('Costco')
		expect(html).toContain('different store')
		expect(html.match(/data-testid="choice-option"/g)).toHaveLength(2)
		expect(html.match(/<label[^>]*data-disabled/g)).toHaveLength(1)
		expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Review Receipt<\/button>/)
	})

	it('offers a new upload when nothing is available', () => {
		const html = render({ status: 'ready', receipts: [] })
		expect(html).toContain('data-testid="choose-receipt-empty"')
		expect(html).toContain('Upload New Receipt')
		expect(html).not.toContain('choose-receipt-form')
	})

	it('shows a loading status without any list', () => {
		const html = render({ status: 'loading' })
		expect(html).toContain('role="status"')
		expect(html).not.toContain('choice-option')
	})

	it('explains a failed load and offers to try again', () => {
		const html = render({ status: 'error', message: 'boom' })
		expect(html).toContain('role="alert"')
		expect(html).toContain('Try Again')
		expect(html).not.toContain('boom')
	})
})
