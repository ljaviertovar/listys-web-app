import { UploadTicketDialog } from '@/components/features/tickets'
import { cn } from '@/utils'
import { SECONDARY_ACTION } from './helpers/dashboard-styles'
import { ActiveSessionBanner } from './active-session-banner'
import { DashboardFirstSteps } from './dashboard-first-steps'
import { DashboardGreeting } from './dashboard-greeting'
import { GroupsSectionCard } from './groups-section-card'
import { HistorySectionCard } from './history-section-card'
import { MobileSessionBar } from './mobile-session-bar'
import { NoSessionBanner } from './no-session-banner'
import { ReceiptsSectionCard } from './receipts-section-card'
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
 * The dashboard layout: greeting, the shopping-session hero next to what needs attention, then the three section cards.
 * A brand-new account has nothing for those cards to show, so it gets the three first steps instead.
 */
export function DashboardView({ model, firstName, isGuest = false, hasLists }: Props) {
	const hasUpNext = model.upNext.length > 0
	const { groups, receipts, trips } = model.counts
	const isNewAccount = groups === 0 && receipts === 0 && trips === 0 && !model.activeSession
	// While an account has no lists the hero already is the upload button; a second one in the header would repeat it.
	const showHeaderUpload = hasLists

	return (
		<div
			data-testid='dashboard-view'
			className='flex flex-col gap-6 md:gap-8'
		>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<DashboardGreeting name={firstName} />
				{showHeaderUpload ? (
					<UploadTicketDialog
						variant='outline'
						className={cn(SECONDARY_ACTION, 'w-full sm:w-auto')}
					/>
				) : null}
			</header>

			<div className='grid items-stretch gap-6 lg:grid-cols-5'>
				<div className={cn(hasUpNext ? 'lg:col-span-3' : 'lg:col-span-5')}>
					{model.activeSession ? (
						<ActiveSessionBanner
							session={model.activeSession}
							isGuest={isGuest}
						/>
					) : (
						<NoSessionBanner
							quickStart={model.quickStart}
							startTarget={model.startTarget}
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

			{isNewAccount ? (
				<DashboardFirstSteps />
			) : (
				<div className='grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3'>
					<GroupsSectionCard
						groups={model.groups}
						count={model.counts.groups}
					/>
					<ReceiptsSectionCard
						receipts={model.receipts}
						count={model.counts.receipts}
					/>
					{/* On two columns the third card takes the whole row instead of leaving a half-empty one. */}
					<div className='sm:col-span-2 xl:col-span-1'>
						<HistorySectionCard
							trips={model.trips}
							count={model.counts.trips}
						/>
					</div>
				</div>
			)}

			{/* PageContainer's bottom padding keeps the last card clear of this bar, and `scroll-pb` on <main> keeps focus clear of it. */}
			{model.activeSession ? <MobileSessionBar session={model.activeSession} /> : null}
		</div>
	)
}
