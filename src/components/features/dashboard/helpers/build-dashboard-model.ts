import { buildListDisplayNames, getReceiptStoreLabel } from '@/utils'

/**
 * Pure view-model for the dashboard. Every number and sentence the dashboard shows is derived here from the
 * records the API already returns, so the components stay presentational and nothing on screen is invented.
 */

type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | null

export interface DashboardBaseListInput {
	id: string
	name: string
	is_default?: boolean | null
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
	receipts?: Array<{ id: string; total_amount: number | null }>
}

export interface DashboardLikelyNeededInput {
	id: string
	name: string
	base_list: { id: string; name: string }
	usual_store: { id: string; name: string } | null
	interval_days: number
	days_since: number
}

export interface DashboardStoreInput {
	id: string
	name: string
	last_visit: { kind: 'trip' | 'receipt'; id: string; at: string; total_amount: number | null; items_count?: number | null } | null
}

export interface DashboardActiveSessionInput {
	id: string
	name: string
	base_list_id: string
	/** Who started the trip: another person's active trip on a shared list is something to join. */
	user_id?: string | null
	items?: { checked: boolean | null }[]
	base_list?: { name?: string | null } | null
	collaborators?: { initials: string; display_name?: string | null }[]
}

export interface DashboardModelInput {
	baseLists: DashboardBaseListInput[]
	tickets: DashboardTicketInput[]
	trips: DashboardTripInput[]
	activeSession: DashboardActiveSessionInput | null
	/** Active sessions ordered newest first. The singular field remains for existing model callers. */
	activeSessions?: DashboardActiveSessionInput[]
	likelyNeeded?: DashboardLikelyNeededInput[]
	likelyNeededHasHistory?: boolean
	likelyNeededReceiptCount?: number
	stores?: DashboardStoreInput[]
	/** The signed-in user, to tell their own trips from a collaborator's. */
	currentUserId?: string | null
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
	isDefault?: boolean
	lastTrip?: string | null
}

export interface LikelyNeededPreview extends DashboardLikelyNeededInput { cadence: string }

export interface StoreVisitPreview {
	storeId: string
	storeName: string
	kind: 'trip' | 'receipt'
	id: string
	dateLabel: string
	itemsCount?: number | null
	total: number | null
	href: string
}

export type UpNextKind = 'receipt-waiting' | 'receipt-failed' | 'trip-no-receipt' | 'list-running-low' | 'partner-shopping' | 'list-stale'

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
	activeSession: ActiveSessionSummary | null
	activeSessionIds: Record<string, string>
	otherSessionCount: number
	/** A few of the user's lists, flat: there is no group level any more. */
	lists: { items: ListPreview[]; hiddenCount: number }
	likelyNeeded: { hasHistory: boolean; receiptsCount?: number; items: LikelyNeededPreview[] }
	storeVisits: StoreVisitPreview[]
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
const MAX_STORE_VISITS = 4
const MAX_UP_NEXT = 4
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

function pluralDay(value: number) {
	return `${value} ${value === 1 ? 'day' : 'days'}`
}

export function formatCadence(intervalDays: number, daysSince: number) {
	return `Usually every ${pluralDay(Math.max(1, Math.round(intervalDays)))} · last bought ${pluralDay(Math.max(0, Math.round(daysSince)))} ago`
}

function zonedParts(date: Date, timeZone: string) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
	}).formatToParts(date)
	return Object.fromEntries(parts.map(part => [part.type, Number(part.value)])) as Record<string, number>
}

function localMidnightToUtc(year: number, month: number, day: number, timeZone: string) {
	const target = Date.UTC(year, month - 1, day)
	let guess = target
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const local = zonedParts(new Date(guess), timeZone)
		const represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second)
		guess += target - represented
	}
	return new Date(guess).toISOString()
}

/** Returns the visitor-local calendar month as a half-open UTC interval. */
export function currentMonthRange(now: Date, timeZone: string) {
	const local = zonedParts(now, timeZone)
	const nextYear = local.month === 12 ? local.year + 1 : local.year
	const nextMonth = local.month === 12 ? 1 : local.month + 1
	return {
		from: localMidnightToUtc(local.year, local.month, 1, timeZone),
		to: localMidnightToUtc(nextYear, nextMonth, 1, timeZone),
	}
}

/** The calendar month immediately before the visitor-local current month. */
export function previousMonthRange(now: Date, timeZone: string) {
	const local = zonedParts(now, timeZone)
	const year = local.month === 1 ? local.year - 1 : local.year
	const month = local.month === 1 ? 12 : local.month - 1
	return {
		from: localMidnightToUtc(year, month, 1, timeZone),
		to: localMidnightToUtc(local.year, local.month, 1, timeZone),
	}
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

function buildLists(baseLists: DashboardBaseListInput[], trips: DashboardTripInput[], listNames: Map<string, string>) {
	const lastTripByList = new Map<string, string>()
	for (const trip of trips) {
		if (!trip.completed_at || lastTripByList.has(trip.base_list_id)) continue
		lastTripByList.set(trip.base_list_id, formatShortDate(trip.completed_at))
	}
	return {
		items: baseLists.slice(0, MAX_LISTS_PREVIEW).map(list => ({
			id: list.id,
			name: listNames.get(list.id) ?? list.name,
			itemsCount: itemsCountOf(list),
			isDefault: Boolean(list.is_default),
			lastTrip: lastTripByList.get(list.id) ?? null,
		})),
		hiddenCount: Math.max(baseLists.length - MAX_LISTS_PREVIEW, 0),
	}
}

function ticketTitle(ticket: DashboardTicketInput) {
	return getReceiptStoreLabel(ticket)
}

function buildStoreVisits(stores: DashboardStoreInput[]): StoreVisitPreview[] {
	return [...stores].filter(store => store.last_visit).sort((a, b) =>
		Date.parse(b.last_visit?.at ?? '') - Date.parse(a.last_visit?.at ?? '')
	).flatMap(store => {
		if (!store.last_visit) return []
		const visit = store.last_visit
		return [{
			storeId: store.id,
			storeName: store.name,
			kind: visit.kind,
			id: visit.id,
			dateLabel: formatShortDate(visit.at),
			itemsCount: visit.items_count ?? null,
			total: visit.total_amount,
			href: visit.kind === 'trip' ? '/trips' : `/tickets/${visit.id}`,
		}]
	}).slice(0, MAX_STORE_VISITS)
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
	likelyNeeded: DashboardLikelyNeededInput[] = [],
	sessions: DashboardActiveSessionInput[] = [],
	currentUserId: string | null = null,
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

	const tripWithoutReceipt = trips.find(trip => Array.isArray(trip.receipts) && trip.receipts.length === 0)
	if (tripWithoutReceipt) {
		const listName = listNames.get(tripWithoutReceipt.base_list_id) ?? tripWithoutReceipt.base_list?.name ?? tripWithoutReceipt.name
		items.push({
			id: `trip-no-receipt-${tripWithoutReceipt.id}`,
			kind: 'trip-no-receipt',
			title: 'Trip without a receipt',
			detail: `Add a receipt to ${listName}`,
			href: `/shopping/${tripWithoutReceipt.id}?details=1`,
		})
	}

	// Someone else is shopping a list this account shares: the trip is there to join. Names are not known, so it says "Someone".
	const partner = currentUserId ? sessions.find(session => session.user_id && session.user_id !== currentUserId) : undefined
	if (partner) {
		const checked = (partner.items ?? []).filter(item => item.checked).length
		const total = partner.items?.length ?? 0
		const listName = partner.base_list?.name ?? partner.name
		items.push({
			id: `partner-shopping-${partner.id}`,
			kind: 'partner-shopping',
			title: `Someone is shopping “${listName}”`,
			detail: total > 0 ? `${checked} of ${pluralize(total, 'item')} · Join the trip` : 'Join the trip',
			href: `/shopping/${partner.id}`,
		})
	}

	// The list with the most items whose usual interval has passed: what the household will need first.
	if (likelyNeeded.length > 0) {
		const byList = new Map<string, { id: string; name: string; count: number }>()
		for (const item of likelyNeeded) {
			const entry = byList.get(item.base_list.id) ?? { id: item.base_list.id, name: listNames.get(item.base_list.id) ?? item.base_list.name, count: 0 }
			entry.count += 1
			byList.set(item.base_list.id, entry)
		}
		const lowest = [...byList.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0]
		items.push({
			id: `list-running-low-${lowest.id}`,
			kind: 'list-running-low',
			title: `${lowest.name} is running low`,
			detail: `${pluralize(lowest.count, 'item')} likely needed`,
			href: `/base-lists/${lowest.id}/edit`,
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
	activeSessions,
	likelyNeeded = [],
	likelyNeededHasHistory = false,
	likelyNeededReceiptCount = 0,
	stores = [],
	currentUserId = null,
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
	const sessions = activeSessions ?? (activeSession ? [activeSession] : [])
	const latestSession = sessions[0] ?? null
	const activeSessionIds = Object.fromEntries(sessions.map(session => [session.base_list_id, session.id]))

	return {
		activeSession: buildActiveSession(latestSession, listNames),
		activeSessionIds,
		otherSessionCount: Math.max(sessions.length - 1, 0),
		lists: buildLists(baseLists, trips, listNames),
		likelyNeeded: {
			hasHistory: likelyNeededHasHistory,
		receiptsCount: likelyNeededReceiptCount,
			items: likelyNeeded.map(item => ({ ...item, cadence: formatCadence(item.interval_days, item.days_since) })),
		},
		storeVisits: buildStoreVisits(stores),
		upNext: buildUpNext(tickets, trips, baseLists, listNames, now, likelyNeeded, sessions, currentUserId),
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
