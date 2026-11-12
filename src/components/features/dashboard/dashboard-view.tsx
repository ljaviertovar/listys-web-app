import { UploadTicketDialog } from '@/components/features/tickets'
import { MOBILE_DASHBOARD_SESSION_CLEARANCE } from '@/components/app'
import { cn } from '@/utils'
import { ActiveSessionBanner } from './active-session-banner'
import { DashboardGreeting } from './dashboard-greeting'
import { ListsSectionCard } from './lists-section-card'
import { LikelyNeededCard } from './likely-needed-card'
import { MonthSpendingCard } from './month-spending-card'
import { NoSessionBanner } from './no-session-banner'
import { StoreVisitsCard } from './store-visits-card'
import { UpNextList } from './up-next-list'
import type { DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	model: DashboardModel
	firstName: string
	/** True when the active session belongs to someone else and was shared with the current user. */
	isGuest?: boolean
	hasLists: boolean
}

/**
 * The dashboard layout: greeting and monthly summary, then shopping activity, lists and store sections.
 * An account without data keeps the same layout (approved design A1): the cards show their empty states and the one
 * next step each section has.
 */
export function DashboardView({ model, firstName, isGuest = false, hasLists }: Props) {
	const hasUpNext = model.upNext.length > 0
	const shouldShowLikelyNeeded = model.likelyNeeded.items.length > 0 || (model.likelyNeeded.receiptsCount ?? 0) < 3
	const showActivityHero = Boolean(model.activeSession || model.lastTrip || model.startTarget || hasUpNext)
	// Without lists the hero already is the upload button, so the header one would just repeat it.
	const showHeaderUpload = hasLists

	return (
		<div
			data-testid='dashboard-view'
			// Top space of the design's 20px: +4px on phones, and 12px less than the page gutter from `lg`.
			className={cn('flex flex-col gap-6 pt-1 selection:bg-blue-200 selection:text-blue-950 md:gap-8 md:pt-0 lg:-mt-3 lg:gap-9', model.activeSession && MOBILE_DASHBOARD_SESSION_CLEARANCE)}
		>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<DashboardGreeting name={firstName} />
				{showHeaderUpload ? (
					// Phones upload from the tab bar's raised button, so this one only exists from `lg`.
					<UploadTicketDialog
						variant='secondary'
						className='hidden w-auto lg:inline-flex'
					/>
				) : null}
			</header>

			<MonthSpendingCard />

			{showActivityHero ? (
				<div className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5'>
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
					{hasUpNext ? (
						<div className='lg:col-span-2'>
							<UpNextList items={model.upNext} />
						</div>
					) : null}
				</div>
			) : null}

			<div className='grid grid-cols-1 items-stretch gap-5 max-sm:-mt-1.5 max-sm:gap-4 sm:grid-cols-2 2xl:grid-cols-3'>
				<ListsSectionCard lists={model.lists} activeSessionIds={model.activeSessionIds} />
				{showActivityHero ? <StoreVisitsCard visits={model.storeVisits} /> : null}
				{shouldShowLikelyNeeded ? <LikelyNeededCard likelyNeeded={model.likelyNeeded} startTarget={model.startTarget} /> : null}
			</div>

		</div>
	)
}
