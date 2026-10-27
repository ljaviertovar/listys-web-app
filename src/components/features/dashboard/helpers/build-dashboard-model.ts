import { buildListDisplayNames, getReceiptStoreLabel } from '@/utils'

/**
 * Pure view-model for the dashboard. Every number and sentence the dashboard shows is derived here from the
 * records the API already returns, so the components stay presentational and nothing on screen is invented.
 */

type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | null

export interface DashboardBaseListInput {
	id: string
	name: string
	created_at?: string | null
	items?: { count: number }[]
}

export interface DashboardTicketInput {
	id: string
	store_name: string | null
	/** The store the user confirmed, when the receipt has one. */
	store?: { name: string } | null
	ocr_status: OcrStatus
	total_items: number | null
	created_at: string | null
	base_list_id: string | null
}

export interface DashboardTripInput {
	id: string
	name: string
	base_list_id: string
	total_amount: number | null
	completed_at: string | null
	purchased_count?: number
	base_list: { name: string } | null
}

export interface DashboardActiveSessionInput {
	id: string
	name: string
	base_list_id: string
	items?: { checked: boolean | null }[]
	base_list?: { name?: string | null } | null
	collaborators?: { initials: string; display_name?: string | null }[]
}

export interface DashboardModelInput {
	baseLists: DashboardBaseListInput[]
	tickets: DashboardTicketInput[]
	trips: DashboardTripInput[]
	activeSession: DashboardActiveSessionInput | null
	now?: Date
}

export interface ActiveSessionSummary {
	id: string
	name: string
	listName: string | null
	total: number
	checked: number
	remaining: number
	progress: number
	collaborators: { initials: string; display_name?: string | null }[]
}

export interface ListPreview {
	id: string
	/** The name the screen uses: lists that share a name read "Weekly" and "Weekly (2)". */
	name: string
	itemsCount: number
}

export interface ReceiptPreview {
	id: string
	title: string
	meta: string
	status: 'completed' | 'processing' | 'failed' | 'pending'
}

export interface TripPreview {
	id: string
	name: string
	meta: string
	total: number | null
	/** Trips are browsed on the one history screen. */
	href: string
}

export type UpNextKind = 'receipt-waiting' | 'receipt-failed' | 'list-stale'

export interface UpNextItem {
	id: string
	kind: UpNextKind
	title: string
	detail: string
	href: string
}

export interface QuickStartList {
	id: string
	name: string
	itemsCount: number
}

export interface DashboardModel {
	counts: { receipts: number; trips: number }
	activeSession: ActiveSessionSummary | null
	/** A few of the user's lists, flat: there is no group level any more. */
	lists: { items: ListPreview[]; hiddenCount: number }
	receipts: ReceiptPreview[]
	trips: TripPreview[]
	upNext: UpNextItem[]
	/** Lists with items, up to a few; they are the shortcuts under the hero. */
	quickStart: QuickStartList[]
	/** The list the hero starts: the most overdue one, else the first with items. Null when no list has items. */
	startTarget: QuickStartList | null
	/** The only list of the account when it has no items yet (a new user's Pantry): the hero sends them to fill it. */
	addItemsTarget: { id: string; name: string } | null
	lastTrip: { listName: string; dateLabel: string; total: number | null } | null
}

const MAX_LISTS_PREVIEW = 5
const MAX_RECEIPTS_PREVIEW = 3
const MAX_TRIPS_PREVIEW = 3
const MAX_UP_NEXT = 3
const MAX_QUICK_START = 3
const STALE_LIST_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`
}

/** Short English date such as "14 Feb"; the dashboard copy is English while `formatDate` is not. */
export function formatShortDate(value: string | null | undefined) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''
	return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

function daysBetween(from: string, now: Date) {
	const diff = now.getTime() - new Date(from).getTime()
	return Math.max(0, Math.floor(diff / DAY_MS))
}

function itemsCountOf(list: DashboardBaseListInput) {
	return list.items?.[0]?.count ?? 0
}

function buildActiveSession(
	session: DashboardActiveSessionInput | null,
	listNames: Map<string, string>,
): ActiveSessionSummary | null {
	if (!session) return null

	const total = session.items?.length ?? 0
	const checked = session.items?.filter(item => item.checked === true).length ?? 0

	return {
		id: session.id,
		name: session.name || 'Current shopping',
		listName: listNames.get(session.base_list_id) ?? session.base_list?.name ?? null,
		total,
		checked,
		remaining: Math.max(total - checked, 0),
		progress: total > 0 ? Math.round((checked / total) * 100) : 0,
		collaborators: session.collaborators ?? [],
	}
}

function buildLists(baseLists: DashboardBaseListInput[], listNames: Map<string, string>) {
	return {
		items: baseLists.slice(0, MAX_LISTS_PREVIEW).map(list => ({
			id: list.id,
			name: listNames.get(list.id) ?? list.name,
			itemsCount: itemsCountOf(list),
		})),
		hiddenCount: Math.max(baseLists.length - MAX_LISTS_PREVIEW, 0),
	}
}

function ticketTitle(ticket: DashboardTicketInput) {
	return getReceiptStoreLabel(ticket)
}

function buildReceipts(tickets: DashboardTicketInput[]): ReceiptPreview[] {
	return tickets.slice(0, MAX_RECEIPTS_PREVIEW).map(ticket => {
		const date = formatShortDate(ticket.created_at)
		const items = ticket.total_items ? `${pluralize(ticket.total_items, 'item')} extracted` : null
		const status =
			ticket.ocr_status === 'completed' ? 'completed' : ticket.ocr_status === 'failed' ? 'failed' : ticket.ocr_status === 'processing' ? 'processing' : 'pending'

		return {
			id: ticket.id,
			title: ticketTitle(ticket),
			meta: [date, items].filter(Boolean).join(' · '),
			status,
		}
	})
}

function buildTrips(trips: DashboardTripInput[], listNames: Map<string, string>): TripPreview[] {
	return trips.slice(0, MAX_TRIPS_PREVIEW).map(trip => ({
		id: trip.id,
		name: listNames.get(trip.base_list_id) ?? trip.base_list?.name ?? trip.name,
		meta: formatShortDate(trip.completed_at),
		total: trip.total_amount,
		href: '/shopping-history',
	}))
}

/** The list that has been shopped before, not within the last STALE_LIST_DAYS, and has items to buy; the longest wait first. */
function findMostOverdueList(trips: DashboardTripInput[], baseLists: DashboardBaseListInput[], now: Date) {
	const lastTripByList = new Map<string, string>()
	for (const trip of trips) {
		if (!trip.completed_at) continue
		const known = lastTripByList.get(trip.base_list_id)
		if (!known || new Date(trip.completed_at) > new Date(known)) lastTripByList.set(trip.base_list_id, trip.completed_at)
	}

	return baseLists
		.map(list => ({ list, last: lastTripByList.get(list.id) }))
		.filter((entry): entry is { list: DashboardBaseListInput; last: string } => Boolean(entry.last))
		.map(entry => ({ ...entry, days: daysBetween(entry.last, now) }))
		.filter(entry => entry.days >= STALE_LIST_DAYS && itemsCountOf(entry.list) > 0)
		.sort((a, b) => b.days - a.days)[0]
}

function buildUpNext(
	tickets: DashboardTicketInput[],
	trips: DashboardTripInput[],
	baseLists: DashboardBaseListInput[],
	listNames: Map<string, string>,
	now: Date,
): UpNextItem[] {
	const items: UpNextItem[] = []

	const waiting = tickets.find(ticket => ticket.ocr_status === 'completed' && !ticket.base_list_id)
	if (waiting) {
		items.push({
			id: `receipt-waiting-${waiting.id}`,
			kind: 'receipt-waiting',
			title: `${pluralize(waiting.total_items ?? 0, 'item')} from “${ticketTitle(waiting)}” ${waiting.total_items === 1 ? 'is' : 'are'} waiting`,
			detail: 'Add them to one of your lists',
			href: `/tickets/${waiting.id}`,
		})
	}

	const failed = tickets.find(ticket => ticket.ocr_status === 'failed')
	if (failed) {
		items.push({
			id: `receipt-failed-${failed.id}`,
			kind: 'receipt-failed',
			title: 'A receipt couldn’t be read',
			detail: 'Open it to try again or upload a clearer photo',
			href: `/tickets/${failed.id}`,
		})
	}

	const stale = findMostOverdueList(trips, baseLists, now)

	if (stale) {
		const listName = listNames.get(stale.list.id) ?? stale.list.name
		items.push({
			id: `list-stale-${stale.list.id}`,
			kind: 'list-stale',
			title: `${listName}: last shopped ${pluralize(stale.days, 'day')} ago`,
			detail: `${pluralize(itemsCountOf(stale.list), 'item')} ready`,
			href: `/base-lists/${stale.list.id}/edit`,
		})
	}

	return items.slice(0, MAX_UP_NEXT)
}

export function buildDashboardModel({
	baseLists,
	tickets,
	trips,
	activeSession,
	now = new Date(),
}: DashboardModelInput): DashboardModel {
	const listNames = buildListDisplayNames(baseLists)
	const nameOf = (list: DashboardBaseListInput) => listNames.get(list.id) ?? list.name
	const toQuickStart = (list: DashboardBaseListInput): QuickStartList => ({
		id: list.id,
		name: nameOf(list),
		itemsCount: itemsCountOf(list),
	})
	const quickStart = baseLists.filter(list => itemsCountOf(list) > 0).slice(0, MAX_QUICK_START).map(toQuickStart)
	const overdue = findMostOverdueList(trips, baseLists, now)
	const startTarget = overdue ? toQuickStart(overdue.list) : (quickStart[0] ?? null)

	const onlyList = baseLists.length === 1 ? baseLists[0] : null
	const addItemsTarget = onlyList && itemsCountOf(onlyList) === 0 ? { id: onlyList.id, name: nameOf(onlyList) } : null

	const latest = trips[0]

	return {
		counts: { receipts: tickets.length, trips: trips.length },
		activeSession: buildActiveSession(activeSession, listNames),
		lists: buildLists(baseLists, listNames),
		receipts: buildReceipts(tickets),
		trips: buildTrips(trips, listNames),
		upNext: buildUpNext(tickets, trips, baseLists, listNames, now),
		quickStart,
		startTarget,
		addItemsTarget,
		lastTrip: latest
			? {
					listName: listNames.get(latest.base_list_id) ?? latest.base_list?.name ?? latest.name,
					dateLabel: formatShortDate(latest.completed_at),
					total: latest.total_amount,
				}
			: null,
	}
}
