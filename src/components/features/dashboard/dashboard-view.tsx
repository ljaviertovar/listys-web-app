import { UploadTicketDialog } from '@/components/features/tickets'
import { MOBILE_DASHBOARD_SESSION_CLEARANCE } from '@/components/app'
import { cn } from '@/utils'
import { ActiveSessionBanner } from './active-session-banner'
import { ListsSectionCard } from './lists-section-card'
import { GetStartedCard } from './get-started-card'
import { LikelyNeededCard } from './likely-needed-card'
import { MonthSpendingCard } from './month-spending-card'
import { NoSessionBanner } from './no-session-banner'
import { StoreVisitsCard } from './store-visits-card'
import { UpNextList } from './up-next-list'
import { GET_STARTED_RECEIPTS, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	model: DashboardModel
	/** True when the active session belongs to someone else and was shared with the current user. */
	isGuest?: boolean
	hasLists: boolean
}

/**
 * The dashboard layout: greeting and monthly summary, then shopping activity, lists and store sections.
 * An account without data keeps the same layout (approved design A1): the cards show their empty states and the one
 * next step each section has.
 */
export function DashboardView({ model, isGuest = false, hasLists }: Props) {
	const hasUpNext = model.upNext.length > 0
	const { getStarted } = model
	const receiptsCount = model.likelyNeeded.receiptsCount ?? 0
	// A section waits for something to show: items likely needed, or the three receipts that make "nothing due" a real answer.
	const shouldShowLikelyNeeded = model.likelyNeeded.items.length > 0 || receiptsCount >= GET_STARTED_RECEIPTS
	const shouldShowSpending = !getStarted || model.hasReceipts
	const shouldShowLists = !getStarted || model.lists.items.length > 0
	// The current step of "Get Started" already offers the next action, so the no-trip hero would only repeat it.
	const showActivityHero = getStarted
		? Boolean(model.activeSession || hasUpNext)
		: Boolean(model.activeSession || model.lastTrip || model.startTarget || hasUpNext)
	// Only an active trip keeps the banner while "Get Started" shows; "Up Next" then stands alone.
	const showBanner = !getStarted || Boolean(model.activeSession)
	// Store visits has no empty row of its own to show here: it comes back with its first visit.
	const shouldShowStoreVisits = showActivityHero && (!getStarted || model.storeVisits.length > 0)
	const showSections = shouldShowLists || shouldShowStoreVisits || shouldShowLikelyNeeded
	// Without lists the hero already is the upload button, so the header one would just repeat it.
	const showHeaderUpload = hasLists

	return (
		<div
			data-testid='dashboard-view'
			// Top space of the design's 20px: +4px on phones, and 12px less than the page gutter from `lg`.
			className={cn(
				'flex flex-col gap-6 pt-1 selection:bg-blue-200 selection:text-blue-950 md:gap-8 md:pt-0 lg:-mt-3 lg:gap-9',
				model.activeSession && MOBILE_DASHBOARD_SESSION_CLEARANCE,
			)}
		>
			{showHeaderUpload ? (
				// Phones upload from the tab bar's raised button, so this one only exists from `lg`.
				<header className='hidden lg:flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
					<UploadTicketDialog
						variant='secondary'
						className='hidden w-auto lg:inline-flex'
					/>
				</header>
			) : null}

			{/* An established account keeps the summary first; while "Get Started" shows, the path comes before it. */}
			{!getStarted && shouldShowSpending ? <MonthSpendingCard /> : null}

			{showActivityHero ? (
				<div className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5'>
					{showBanner ? (
						<div className={cn(hasUpNext ? 'lg:col-span-3' : 'lg:col-span-5')}>
							{model.activeSession ? (
								<ActiveSessionBanner
									session={model.activeSession}
									isGuest={isGuest}
									otherSessionCount={model.otherSessionCount}
								/>
							) : (
								<NoSessionBanner
									quickStart={model.quickStart}
									startTarget={model.startTarget}
									addItemsTarget={model.addItemsTarget}
									lastTrip={model.lastTrip}
									hasLists={hasLists}
								/>
							)}
						</div>
					) : null}
					{hasUpNext ? (
						<div className={cn(showBanner ? 'lg:col-span-2' : 'lg:col-span-5')}>
							<UpNextList items={model.upNext} />
						</div>
					) : null}
				</div>
			) : null}

			{getStarted ? (
				<>
					<GetStartedCard
						getStarted={getStarted}
						startTarget={model.startTarget}
						addItemsTarget={model.addItemsTarget}
						tripInProgress={Boolean(model.activeSession)}
					/>
					{shouldShowSpending ? <MonthSpendingCard /> : null}
				</>
			) : null}

			{showSections ? (
				<div className='grid grid-cols-1 items-stretch gap-5 max-sm:-mt-1.5 max-sm:gap-4 sm:grid-cols-2 2xl:grid-cols-3'>
					{shouldShowLists ? (
						<ListsSectionCard
							lists={model.lists}
							activeSessionIds={model.activeSessionIds}
						/>
					) : null}
					{shouldShowStoreVisits ? <StoreVisitsCard visits={model.storeVisits} /> : null}
					{shouldShowLikelyNeeded ? (
						<LikelyNeededCard likelyNeeded={model.likelyNeeded} />
					) : null}
				</div>
			) : null}
		</div>
	)
}
