import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildDashboardModel, type DashboardModelInput } from '../helpers/build-dashboard-model'
import { DashboardView } from '../dashboard-view'

const { stubOf } = vi.hoisted(() => ({
	stubOf: async (name: string, testId: string) => {
		const { createElement: h } = await import('react')
		return { [name]: () => h('div', { 'data-testid': testId }) }
	},
}))
vi.mock('../get-started-card', () => stubOf('GetStartedCard', 'dashboard-get-started'))
vi.mock('../month-spending-card', () => stubOf('MonthSpendingCard', 'dashboard-month-spending-card'))
vi.mock('../lists-section-card', () => stubOf('ListsSectionCard', 'dashboard-lists-card'))
vi.mock('../likely-needed-card', () => stubOf('LikelyNeededCard', 'dashboard-likely-needed-card'))
vi.mock('../store-visits-card', () => stubOf('StoreVisitsCard', 'dashboard-store-visits-card'))
vi.mock('../no-session-banner', () => stubOf('NoSessionBanner', 'dashboard-no-session-banner'))
vi.mock('../active-session-banner', () => stubOf('ActiveSessionBanner', 'dashboard-active-session-banner'))
vi.mock('../up-next-list', () => stubOf('UpNextList', 'dashboard-up-next'))
vi.mock('@/components/features/tickets', () => stubOf('UploadTicketDialog', 'upload-dialog'))

const NOW = new Date('2026-02-19T15:00:00Z')
const list = { id: 'l1', name: 'Pantry', is_default: true, items: [{ count: 4 }] }
const trip = { id: 't1', name: 'Trip', base_list_id: 'l1', total_amount: 10, completed_at: '2026-02-10T10:00:00Z', base_list: { name: 'Pantry' } }
const receipt = { id: 'r1', store_name: 'Costco', ocr_status: 'completed' as const, total_items: 3, created_at: '2026-02-10T10:00:00Z', base_list_id: 'l1' }
const activeSession = { id: 's1', name: 'Trip', base_list_id: 'l1', base_list: { name: 'Pantry' }, items: [{ checked: false }] }

function render(overrides: Partial<DashboardModelInput> = {}) {
	const input = { baseLists: [], tickets: [], trips: [], activeSession: null, now: NOW, ...overrides }
	const model = buildDashboardModel(input)
	return renderToStaticMarkup(createElement(DashboardView, { model, hasLists: input.baseLists.length > 0 }))
}

const sectionIds = ['dashboard-month-spending-card', 'dashboard-lists-card', 'dashboard-likely-needed-card', 'dashboard-no-session-banner']

describe('DashboardView with Get Started', () => {
	it('shows only the path on a brand-new account', () => {
		const html = render()
		expect(html).toContain('dashboard-get-started')
		for (const id of sectionIds) expect(html).not.toContain(id)
	})

	it('brings Lists back with the first list, and still leaves out the no-trip hero', () => {
		const html = render({ baseLists: [list] })
		expect(html).toContain('dashboard-get-started')
		expect(html).toContain('dashboard-lists-card')
		expect(html).not.toContain('dashboard-no-session-banner')
		expect(html).not.toContain('dashboard-month-spending-card')
	})

	it('brings This Month back with the first receipt, after the path', () => {
		const html = render({ tickets: [receipt] })
		expect(html.indexOf('dashboard-get-started')).toBeLessThan(html.indexOf('dashboard-month-spending-card'))
		expect(html).not.toContain('dashboard-likely-needed-card')
	})

	it('keeps the active trip above the path', () => {
		const html = render({ baseLists: [list], activeSession })
		expect(html).toContain('dashboard-active-session-banner')
		expect(html.indexOf('dashboard-active-session-banner')).toBeLessThan(html.indexOf('dashboard-get-started'))
	})

	it('keeps Up Next on its own, with no no-trip hero and no empty Store Visits, when a receipt waits', () => {
		const waiting = { ...receipt, id: 'r2', base_list_id: null }
		const html = render({ baseLists: [list], tickets: [waiting] })
		expect(html).toContain('dashboard-up-next')
		expect(html).toContain('dashboard-get-started')
		expect(html).not.toContain('dashboard-no-session-banner')
		expect(html).not.toContain('dashboard-store-visits-card')
		expect(html).toContain('lg:col-span-5')
	})

	it('shows Likely Needed once three receipts exist, even with nothing due', () => {
		expect(render({ likelyNeededReceiptCount: 3 })).toContain('dashboard-likely-needed-card')
	})
})

describe('DashboardView once the path is done', () => {
	it('looks like the established dashboard', () => {
		const html = render({ baseLists: [list], trips: [trip], tickets: [receipt], likelyNeededReceiptCount: 3 })
		expect(html).not.toContain('dashboard-get-started')
		for (const id of ['dashboard-month-spending-card', 'dashboard-lists-card', 'dashboard-likely-needed-card', 'dashboard-no-session-banner']) {
			expect(html).toContain(id)
		}
		expect(html.indexOf('dashboard-month-spending-card')).toBeLessThan(html.indexOf('dashboard-no-session-banner'))
	})
})
