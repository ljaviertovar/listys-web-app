import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { DashboardView, buildDashboardModel } from '@/components/features/dashboard'
import { ActiveSessionBanner } from '@/components/features/dashboard/active-session-banner'
import { DashboardLoadError } from '@/components/features/dashboard/dashboard-load-error'
import { GroupsSectionCard } from '@/components/features/dashboard/groups-section-card'
import { HistorySectionCard } from '@/components/features/dashboard/history-section-card'
import { HeroSurface } from '@/components/features/dashboard/hero-surface'
import { MobileSessionBar } from '@/components/features/dashboard/mobile-session-bar'
import { NoSessionBanner } from '@/components/features/dashboard/no-session-banner'
import { ReceiptsSectionCard } from '@/components/features/dashboard/receipts-section-card'
import { UpNextList } from '@/components/features/dashboard/up-next-list'
import type { ActiveSessionSummary } from '@/components/features/dashboard/helpers/build-dashboard-model'

// The upload and start-shopping dialogs read the App Router; their own flows are covered where they live.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const session: ActiveSessionSummary = {
	id: 's1',
	name: 'Items for Dinner',
	groupName: 'Walmart',
	listName: 'NO frills',
	total: 19,
	checked: 3,
	remaining: 16,
	progress: 16,
	collaborators: [],
}

const quickStart = [{ id: 'l1', name: 'NO frills', groupName: 'Walmart', itemsCount: 28 }]
const otherList = { id: 'l2', name: 'Weekly Groceries', groupName: 'Costco', itemsCount: 12 }

function modelWith(overrides: Partial<Parameters<typeof buildDashboardModel>[0]> = {}) {
	return buildDashboardModel({
		groups: [{ id: 'g1', name: 'Walmart', description: null, base_lists: [{ count: 1 }] }],
		baseLists: [{ id: 'l1', name: 'NO frills', group_id: 'g1', items: [{ count: 28 }] }],
		tickets: [],
		trips: [],
		activeSession: null,
		...overrides,
	})
}

describe('ActiveSessionBanner', () => {
	it('shows where the trip is from, how far along it is and a way to continue', () => {
		const html = renderToStaticMarkup(createElement(ActiveSessionBanner, { session }))

		expect(html).toContain('data-testid="dashboard-active-session-banner"')
		expect(html).toContain('Walmart › NO frills')
		expect(html).toContain('Items for Dinner')
		expect(html).toContain('3 items in the cart, 16 to go')
		expect(html).toContain('3 of 19 items · 16%')
		expect(html).toContain('href="/shopping/s1"')
	})

	it('says so when a trip was shared with the user and does not claim sharing when it is private', () => {
		expect(renderToStaticMarkup(createElement(ActiveSessionBanner, { session, isGuest: true }))).toContain('Shared with you')
		expect(renderToStaticMarkup(createElement(ActiveSessionBanner, { session }))).not.toContain('Shared with')
	})

	it('handles a trip that has no items yet', () => {
		const html = renderToStaticMarkup(createElement(ActiveSessionBanner, { session: { ...session, total: 0, checked: 0, remaining: 0, progress: 0 } }))

		expect(html).toContain('This shopping session has no items yet')
	})
})

describe('NoSessionBanner', () => {
	it('offers the next trip and quick-start lists to someone who already has lists', () => {
		const html = renderToStaticMarkup(
			createElement(NoSessionBanner, {
				quickStart: [...quickStart, otherList],
				startTarget: quickStart[0],
				hasLists: true,
				lastTrip: { listName: 'NO frills', dateLabel: '14 Feb', total: 86.4 },
			}),
		)

		expect(html).toContain('Ready to go shopping?')
		expect(html).toContain('No shopping session in progress')
		expect(html).toContain('Start “NO frills” (Walmart · 28 items)')
		expect(html).toContain('data-testid="start-shopping-button"')
		expect(html).toContain('Last shopping session · NO frills · 14 Feb · $86.40')
	})

	it('starts one list from the button and keeps the others as shortcuts, never the same list twice', () => {
		const html = renderToStaticMarkup(
			createElement(NoSessionBanner, { quickStart: [...quickStart, otherList], startTarget: quickStart[0], hasLists: true, lastTrip: null }),
		)

		expect(html).toContain('Your lists')
		expect(html).toContain('data-testid="dashboard-quick-start-l2"')
		expect(html).not.toContain('data-testid="dashboard-quick-start-l1"')
		expect(html).toContain('min-h-11')
	})

	it('shows no shortcuts when the only list is the one the button starts', () => {
		const html = renderToStaticMarkup(createElement(NoSessionBanner, { quickStart, startTarget: quickStart[0], hasLists: true, lastTrip: null }))

		expect(html).not.toContain('Your lists')
	})

	it('sends someone whose lists are all empty to their lists instead of a start button', () => {
		const html = renderToStaticMarkup(createElement(NoSessionBanner, { quickStart: [], startTarget: null, hasLists: true, lastTrip: null }))

		expect(html).toContain('Open your lists')
		expect(html).toContain('href="/shopping-lists"')
		expect(html).not.toContain('start-shopping-button')
	})

	it('points a new user at a receipt instead of an empty list picker', () => {
		const html = renderToStaticMarkup(createElement(NoSessionBanner, { quickStart: [], startTarget: null, hasLists: false, lastTrip: null }))

		expect(html).toContain('Start with a receipt')
		expect(html).toContain('Upload Receipt')
		expect(html).not.toContain('Your lists')
		expect(html).not.toContain('Last shopping session')
	})
})

describe('UpNextList', () => {
	it('renders nothing when there is nothing to act on', () => {
		expect(renderToStaticMarkup(createElement(UpNextList, { items: [] }))).toBe('')
	})

	it('links each entry to where it can be resolved', () => {
		const html = renderToStaticMarkup(
			createElement(UpNextList, {
				items: [
					{ id: 'a', kind: 'receipt-waiting', title: '28 items are waiting', detail: 'Add them to a list', href: '/tickets/t1' },
					{ id: 'b', kind: 'receipt-failed', title: 'A receipt couldn’t be read', detail: 'Open it to try again', href: '/tickets/t2' },
				],
			}),
		)

		expect(html).toContain('data-testid="dashboard-up-next"')
		expect(html).toContain('href="/tickets/t1"')
		expect(html).toContain('data-testid="dashboard-up-next-receipt-failed"')
	})
})

describe('MobileSessionBar', () => {
	it('keeps the trip progress and the continue action in a bar that only exists on phones', () => {
		const html = renderToStaticMarkup(createElement(MobileSessionBar, { session }))

		expect(html).toContain('data-testid="dashboard-mobile-session-bar"')
		expect(html).toContain('lg:hidden')
		expect(html).toContain('3 of 19 items · 16%')
		expect(html).toContain('href="/shopping/s1"')
		expect(html).toContain('Continue<span class="sr-only"> shopping</span>')
	})

	it('starts out of the way, because the hero and its own button are what the page opens on', () => {
		const html = renderToStaticMarkup(createElement(MobileSessionBar, { session }))

		expect(html).toContain('data-hidden="true"')
		expect(html).toContain('aria-hidden="true"')
		expect(html).toContain('translate-y-full')
	})
})

describe('DashboardView', () => {
	it('shows the active-session hero and the fixed phone bar while a trip is running', () => {
		const html = renderToStaticMarkup(
			createElement(DashboardView, {
				firstName: 'Javier',
				hasLists: true,
				model: modelWith({
					activeSession: { id: 's1', name: 'Items for Dinner', base_list_id: 'l1', base_list: { group_id: 'g1', name: 'NO frills' }, items: [{ checked: true }, { checked: false }] },
				}),
			}),
		)

		expect(html).toContain('dashboard-active-session-banner')
		expect(html).toContain('dashboard-mobile-session-bar')
		expect(html).not.toContain('dashboard-no-session-banner')
	})

	it('shows the next-trip hero, the three sections and no phone bar when nothing is running', () => {
		const html = renderToStaticMarkup(createElement(DashboardView, { firstName: 'Javier', hasLists: true, model: modelWith() }))

		expect(html).toContain('dashboard-no-session-banner')
		expect(html).toContain('data-testid="dashboard-groups-card"')
		expect(html).toContain('data-testid="dashboard-receipts-card"')
		expect(html).toContain('data-testid="dashboard-history-card"')
		expect(html).not.toContain('dashboard-mobile-session-bar')
		expect(html).toContain('Hi, Javier')
	})

	it('nests each group’s lists under it and offers an empty-state for sections without data', () => {
		const html = renderToStaticMarkup(createElement(DashboardView, { firstName: 'Javier', hasLists: true, model: modelWith() }))

		expect(html).toContain('data-testid="dashboard-group-g1"')
		expect(html).toContain('data-testid="dashboard-list-l1"')
		expect(html).toContain('No receipts yet')
		expect(html).toContain('No shopping sessions yet')
	})
})

describe('section cards', () => {
	it('keeps Upload out of the receipts footer once there are receipts, leaving only the right-aligned link', () => {
		const html = renderToStaticMarkup(
			createElement(ReceiptsSectionCard, { count: 1, receipts: [{ id: 't1', title: 'Grocery', meta: '17 Feb · 28 items extracted', status: 'completed' }] }),
		)

		expect(html).not.toContain('Upload Receipt')
		expect(html).toContain('data-testid="dashboard-receipts-view-all"')
		expect(html).toContain('justify-end')
	})

	it('offers the first step inside each empty card, below the copy', () => {
		const receipts = renderToStaticMarkup(createElement(ReceiptsSectionCard, { count: 0, receipts: [] }))
		const groups = renderToStaticMarkup(createElement(GroupsSectionCard, { count: 0, groups: [] }))

		expect(receipts).toContain('data-testid="dashboard-receipts-empty"')
		expect(receipts).toContain('No receipts yet')
		expect(receipts.indexOf('No receipts yet')).toBeLessThan(receipts.indexOf('Upload Receipt'))
		expect(groups.indexOf('No groups yet')).toBeLessThan(groups.indexOf('data-testid="create-group-button"'))
	})

	it('titles each card with a real heading and shows only two rows on phones', () => {
		const html = renderToStaticMarkup(createElement(ReceiptsSectionCard, { count: 0, receipts: [] }))

		expect(html).toMatch(/<h2[^>]*>Receipts<\/h2>/)
		expect(html).toContain('max-md:[&amp;&gt;*:nth-child(n+3)]:hidden')
	})

	it('shows a finished receipt as quiet text and any other state as a badge', () => {
		const html = renderToStaticMarkup(
			createElement(ReceiptsSectionCard, {
				count: 2,
				receipts: [
					{ id: 'a', title: 'Grocery', meta: '17 Feb', status: 'completed' },
					{ id: 'b', title: 'Pharmacy', meta: '18 Feb', status: 'failed' },
				],
			}),
		)

		expect(html).toContain('<span class="text-xs text-muted-foreground">Completed</span>')
		expect(html).toContain('Failed')
		expect(html).not.toContain('data-slot="badge">Completed')
	})

	it('does not show the create-group button when groups already exist', () => {
		const groups = renderToStaticMarkup(
			createElement(GroupsSectionCard, { count: 1, groups: [{ id: 'g1', name: 'Walmart', description: null, listsCount: 0, lists: [], hiddenListsCount: 0 }] }),
		)

		expect(groups).not.toContain('create-group-button')
	})

	it('gives the three empty states the same height, with History carrying no action', () => {
		const html = [
			renderToStaticMarkup(createElement(GroupsSectionCard, { count: 0, groups: [] })),
			renderToStaticMarkup(createElement(ReceiptsSectionCard, { count: 0, receipts: [] })),
			renderToStaticMarkup(createElement(HistorySectionCard, { count: 0, trips: [] })),
		].join('')

		expect(html.match(/h-\[172px\]/g)).toHaveLength(3)
		expect(html).toContain('data-testid="dashboard-history-empty"')
	})
})

describe('an account without data', () => {
	const emptyModel = () => buildDashboardModel({ groups: [], baseLists: [], tickets: [], trips: [], activeSession: null })
	const emptyView = () => renderToStaticMarkup(createElement(DashboardView, { firstName: 'Javier', hasLists: false, model: emptyModel() }))

	it('keeps the full layout of design A1: the hero that asks for a receipt and the three empty cards', () => {
		const html = emptyView()

		expect(html).toContain('dashboard-no-session-banner')
		expect(html).toContain('Start with a receipt')
		expect(html).not.toContain('No shopping session in progress')
		expect(html).toContain('1–5 photos · you review every item before it is saved')
		expect(html).toContain('data-testid="dashboard-groups-empty"')
		expect(html).toContain('data-testid="dashboard-receipts-empty"')
		expect(html).toContain('data-testid="dashboard-history-empty"')
		expect(html).not.toContain('dashboard-first-steps')
	})

	it('offers the first step in the groups and receipts cards, and none in History', () => {
		const html = emptyView()

		expect(html).toContain('data-testid="create-group-button"')
		// The hero's button and the Receipts card's; a header one would repeat the hero's.
		expect(html.match(/Upload Receipt/g)).toHaveLength(2)
		expect(html.match(/h-\[172px\]/g)).toHaveLength(3)
	})

	it('keeps each empty card’s description on phones, where a card with rows drops it', () => {
		const empty = renderToStaticMarkup(createElement(ReceiptsSectionCard, { count: 0, receipts: [] }))
		const filled = renderToStaticMarkup(
			createElement(ReceiptsSectionCard, { count: 1, receipts: [{ id: 'a', title: 'Grocery', meta: '17 Feb', status: 'completed' }] }),
		)

		expect(empty).not.toContain('max-md:hidden')
		expect(filled).toContain('max-md:hidden')
	})

	it('greets with the date and a line of context, the same in every state', () => {
		const html = emptyView()

		expect(html).toContain('data-testid="dashboard-date-badge"')
		expect(html).toContain('Here&#x27;s what&#x27;s happening with your household&#x27;s shopping today.')
	})

	it('shows the header Upload only once the account has lists, since before that the hero is the upload', () => {
		const withLists = renderToStaticMarkup(createElement(DashboardView, { firstName: 'Javier', hasLists: true, model: modelWith() }))
		const header = (html: string) => html.slice(html.indexOf('<header'), html.indexOf('</header>'))

		expect(header(withLists)).toContain('Upload Receipt')
		expect(header(emptyView())).not.toContain('Upload Receipt')
	})
})

describe('DashboardLoadError', () => {
	it('says what happened, that nothing changed, and offers a retry', () => {
		const html = renderToStaticMarkup(createElement(DashboardLoadError))

		expect(html).toContain('role="alert"')
		expect(html).toContain('We couldn’t load your dashboard')
		expect(html).toContain('data-testid="dashboard-load-error-retry"')
	})
})

describe('HeroSurface', () => {
	it('puts the photo behind an ink scrim and names the hero by its heading', () => {
		// The component requires `children`, which createElement's variadic form does not satisfy for the type checker.
		// eslint-disable-next-line react/no-children-prop
		const html = renderToStaticMarkup(createElement(HeroSurface, { testId: 'hero', labelledBy: 'hero-title', children: createElement('h2', { id: 'hero-title' }, 'Hello') }))

		expect(html).toContain('aria-labelledby="hero-title"')
		expect(html).toContain('alt=""')
		expect(html).toContain('rgba(15,23,42,.93)')
		expect(html).toContain('shadow-card')
	})
})

describe('the start button', () => {
	it('names the list it starts, so repeated buttons are told apart', () => {
		const html = renderToStaticMarkup(
			createElement(GroupsSectionCard, {
				count: 1,
				groups: [{ id: 'g1', name: 'Walmart', description: null, listsCount: 1, lists: [{ id: 'l1', name: 'NO frills', itemsCount: 3 }], hiddenListsCount: 0 }],
			}),
		)

		expect(html).toContain('aria-label="Start shopping NO frills"')
	})
})
