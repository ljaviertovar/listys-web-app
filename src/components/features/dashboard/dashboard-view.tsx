import { UploadTicketDialog } from '@/components/features/tickets'
import { cn } from '@/utils'
import { SECONDARY_ACTION } from './helpers/dashboard-styles'
import { ActiveSessionBanner } from './active-session-banner'
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
 * An account without data keeps the same layout (approved design A1): the cards show their empty states and the one
 * next step each section has.
 */
export function DashboardView({ model, firstName, isGuest = false, hasLists }: Props) {
	const hasUpNext = model.upNext.length > 0
	// Without lists the hero already is the upload button, so the header one would just repeat it.
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

			{/* PageContainer's bottom padding clears the 72px bar; the spacer adds the device's safe-area inset it also grows by. */}
			{model.activeSession ? (
				<>
					<div
						aria-hidden='true'
						className='-mt-6 h-[env(safe-area-inset-bottom)] lg:hidden'
					/>
					<MobileSessionBar session={model.activeSession} />
				</>
			) : null}
		</div>
	)
}
