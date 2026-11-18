import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildDashboardModel, type DashboardModelInput } from '../helpers/build-dashboard-model'
import { GetStartedCard } from '../get-started-card'

vi.mock('@/components/features/base-lists', () => ({
	SetUpPantryAction: ({ testId }: { testId: string }) => createElement('button', { 'data-testid': `${testId}-button` }, 'Set up Pantry'),
	StartShoppingDialog: ({ children }: { children?: ReactNode }) => createElement('button', { 'data-testid': 'start-shopping' }, children),
}))
vi.mock('@/components/features/tickets', () => ({
	UploadTicketDialog: () => createElement('button', { 'data-testid': 'upload-receipt' }, 'Upload Receipt'),
}))

const list = (count: number) => ({ id: 'l1', name: 'Pantry', items: [{ count }] })
const trip = { id: 't1', name: 'Trip', base_list_id: 'l1', total_amount: 10, completed_at: '2026-02-10T10:00:00Z', base_list: { name: 'Pantry' } }

function render(overrides: Partial<DashboardModelInput> = {}) {
	const model = buildDashboardModel({ baseLists: [], tickets: [], trips: [], activeSession: null, ...overrides })
	if (!model.getStarted) throw new Error('expected Get Started')
	return renderToStaticMarkup(createElement(GetStartedCard, { getStarted: model.getStarted, startTarget: model.startTarget, addItemsTarget: model.addItemsTarget }))
}

describe('GetStartedCard', () => {
	it('opens only the current step, with the Pantry action first', () => {
		const html = render()
		expect(html).toContain('0 of 3')
		expect(html).toContain('dashboard-get-started-pantry-button')
		expect(html).not.toContain('start-shopping')
		expect(html).not.toContain('upload-receipt')
		expect(html.match(/aria-current="step"/g)).toHaveLength(1)
		expect(html).toContain('Set up your Pantry')
		expect(html).toContain('Take a list shopping')
		expect(html).toContain('Scan 3 receipts')
	})

	it('marks a done step, opens the next one and offers no way to dismiss', () => {
		const html = render({ baseLists: [list(5)] })
		expect(html).toContain('1 of 3')
		expect(html).toContain('data-testid="dashboard-get-started-step-list" data-state="done"')
		expect(html).toContain('data-testid="dashboard-get-started-step-trip" data-state="current"')
		expect(html).toContain('start-shopping')
		expect(html).not.toContain('dashboard-get-started-pantry-button')
		expect(html.toLowerCase()).not.toContain('dismiss')
	})

	it('sends an account whose list is empty to add items instead of starting a trip', () => {
		const html = render({ baseLists: [list(0)] })
		expect(html).toContain('Add Items')
		expect(html).toContain('/base-lists/l1/edit')
		expect(html).not.toContain('start-shopping')
	})

	it('opens the Lists screen when there are several lists and none has items', () => {
		const html = render({ baseLists: [list(0), { id: 'l2', name: 'Weekly', items: [{ count: 0 }] }] })
		expect(html).toContain('Open Your Lists')
		expect(html).toContain('href="/shopping-lists"')
	})

	it('offers no second way to start a trip while one is running', () => {
		const model = buildDashboardModel({ baseLists: [list(5)], tickets: [], trips: [], activeSession: null })
		if (!model.getStarted) throw new Error('expected Get Started')
		const html = renderToStaticMarkup(
			createElement(GetStartedCard, { getStarted: model.getStarted, startTarget: model.startTarget, addItemsTarget: model.addItemsTarget, tripInProgress: true }),
		)
		expect(html).toMatch(/data-testid="dashboard-get-started-step-trip"[^>]*aria-current="step"/)
		expect(html).not.toContain('start-shopping')
		expect(html).not.toContain('Add Items')
	})

	it('shows how many receipts are in on the last step', () => {
		const html = render({ baseLists: [list(5)], trips: [trip], likelyNeededReceiptCount: 1 })
		expect(html).toContain('2 of 3')
		expect(html).toContain('upload-receipt')
		expect(html).toMatch(/data-testid="dashboard-get-started-step-receipts"[^>]*aria-current="step"/)
		expect(html).toContain('1 of 3')
	})

	it('says the state of each step in words, not only in color', () => {
		const html = render({ baseLists: [list(5)] })
		expect(html).toContain('Done: ')
		expect(html).toContain('Current step: ')
		expect(html).toContain('Not started: ')
	})
})
