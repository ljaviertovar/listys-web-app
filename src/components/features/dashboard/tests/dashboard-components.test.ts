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
		expect(html).toContain('srcSet="/images/dashboard/desktop-session.webp"')
		expect(html).toContain('%2Fimages%2Fdashboard%2Fmobile-session.webp')
		expect(html).toContain('loading="eager"')
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
		expect(html).toContain('srcSet="/images/dashboard/desktop-session.webp"')
		expect(html).toContain('%2Fimages%2Fdashboard%2Fmobile-session.webp')
		expect(html).toContain('Last shopping session · NO frills · 14 Feb · $86.40')
	})

	it('starts one list from the button and keeps the others as shortcuts, never the same list twice', () => {
		const html = renderToStaticMarkup(
			createElement(NoSessionBanner, { quickStart: [...quickStart, otherList], startTarget: quickStart[0], hasLists: true, lastTrip: null }),
		)

		expect(html).toContain('Your lists')
		expect(html).toContain('data-testid="dashboard-quick-start-l2"')
		expect(html).not.toContain('data-testid="dashboard-quick-start-l1"')
		expect(html).toContain('min-h-9')
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
		expect(html).toContain('data-size="xl"')
		expect(html).toContain('rounded-[12px]')
		expect(html).toContain('md:h-[52px]')
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

	it('floats above the tab bar and stays visible next to the hero button, as in design A1', () => {
		const html = renderToStaticMarkup(createElement(MobileSessionBar, { session }))

		expect(html).toContain('fixed')
		expect(html).toContain('bottom-[calc(3rem+max(1.125rem,env(safe-area-inset-bottom)))]')
		expect(html).not.toContain('aria-hidden="true" inert')
		expect(html).not.toContain('translate-y-full')
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
	it('puts the View all link next to the title and no upload button once there are receipts', () => {
		const html = renderToStaticMarkup(
			createElement(ReceiptsSectionCard, { receipts: [{ id: 't1', title: 'Grocery', meta: '17 Feb · 28 items extracted', status: 'completed' }] }),
		)

		expect(html).not.toContain('Upload Receipt')
		expect(html).toContain('data-testid="dashboard-receipts-view-all"')
		expect(html).toContain('View all<span class="sr-only"> receipts</span>')
		expect(html).toContain('min-h-8 shrink-0 items-center gap-1 rounded-[12px] pr-2 pl-2.5 text-xs')
		expect(html.indexOf('dashboard-receipts-view-all')).toBeLessThan(html.indexOf('dashboard-receipt-t1'))
	})

	it('offers the first step inside each empty card, below the copy', () => {
		const receipts = renderToStaticMarkup(createElement(ReceiptsSectionCard, { receipts: [] }))
		const groups = renderToStaticMarkup(createElement(GroupsSectionCard, { groups: [] }))

		expect(receipts).toContain('data-testid="dashboard-receipts-empty"')
		expect(receipts).toContain('h-8 w-auto rounded-[12px] px-3 text-xs font-semibold md:h-11 md:px-4.5 md:text-sm')
		expect(receipts).toContain('No receipts yet')
		expect(receipts.indexOf('No receipts yet')).toBeLessThan(receipts.indexOf('Upload Receipt'))
		expect(groups.indexOf('No groups yet')).toBeLessThan(groups.indexOf('data-testid="create-group-button"'))
		expect(groups).toContain('New group')
	})

	it('titles each card with a real heading that names the card', () => {
		const html = renderToStaticMarkup(createElement(ReceiptsSectionCard, { receipts: [] }))

		expect(html).toMatch(/<h2[^>]*>Receipts<\/h2>/)
		// A real h2, set at the h6 size (16px, 600) on phones and at the h4 size (20px) from md.
		expect(html).toMatch(/<h2[^>]*text-base[^>]*font-semibold[^>]*md:text-xl[^>]*>Receipts<\/h2>/)
		expect(html).toContain('aria-labelledby="dashboard-receipts-card-title"')
	})

	it('gives every receipt state an icon and a word, so colour is never the only cue', () => {
		const html = renderToStaticMarkup(
			createElement(ReceiptsSectionCard, {
				receipts: [
					{ id: 'a', title: 'Grocery', meta: '17 Feb', status: 'completed' },
					{ id: 'b', title: 'Pharmacy', meta: '18 Feb', status: 'failed' },
					{ id: 'c', title: 'Costco', meta: '19 Feb', status: 'processing' },
				],
			}),
		)

		expect(html).toMatch(/text-green-700[^>]*>.*Completed/)
		expect(html).toMatch(/text-red-700[^>]*>.*Failed/)
		expect(html).toMatch(/text-amber-700[^>]*>.*Processing/)
		expect(html).not.toContain('data-slot="badge"')
	})

	it('starts a list from a short "Start" pill that still says which list it starts', () => {
		const html = renderToStaticMarkup(
			createElement(GroupsSectionCard, {
				groups: [{ id: 'g1', name: 'Walmart', description: null, listsCount: 1, lists: [{ id: 'l1', name: 'NO frills', itemsCount: 28 }], hiddenListsCount: 0 }],
			}),
		)

		expect(html).toContain('aria-label="Start shopping NO frills"')
		expect(html).toMatch(/data-testid="start-shopping-button"[^>]*>Start<\/button>/)
		expect(html).toContain('NO frills')
		expect(html).toContain('· 28 items')
	})

	it('does not show the create-group button when groups already exist', () => {
		const groups = renderToStaticMarkup(
			createElement(GroupsSectionCard, { groups: [{ id: 'g1', name: 'Walmart', description: null, listsCount: 0, lists: [], hiddenListsCount: 0 }] }),
		)

		expect(groups).not.toContain('create-group-button')
	})

	it('gives the three empty states the same height, with History carrying no action', () => {
		const html = [
			renderToStaticMarkup(createElement(GroupsSectionCard, { groups: [] })),
			renderToStaticMarkup(createElement(ReceiptsSectionCard, { receipts: [] })),
			renderToStaticMarkup(createElement(HistorySectionCard, { trips: [] })),
		].join('')

		expect(html.match(/min-h-\[172px\]/g)).toHaveLength(3)
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
		expect(html.match(/min-h-\[172px\]/g)).toHaveLength(3)
	})

	it('gives each section its title row with a View all link, filled or empty', () => {
		const html = emptyView()

		expect(html).toContain('data-testid="dashboard-groups-view-all"')
		expect(html).toContain('data-testid="dashboard-receipts-view-all"')
		expect(html).toContain('data-testid="dashboard-history-view-all"')
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
		expect(html).toContain('rgba(8,13,26,.72)')
		expect(html).toContain('rounded-3xl')
	})
})

describe('the start button', () => {
	it('names the list it starts, so repeated buttons are told apart', () => {
		const html = renderToStaticMarkup(
			createElement(GroupsSectionCard, {
				groups: [{ id: 'g1', name: 'Walmart', description: null, listsCount: 1, lists: [{ id: 'l1', name: 'NO frills', itemsCount: 3 }], hiddenListsCount: 0 }],
			}),
		)

		expect(html).toContain('aria-label="Start shopping NO frills"')
	})
})
