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
			// Top space of the design's 20px: +4px on phones, and 12px less than the page gutter from `lg`. Phones also keep room under the page for the floating session pill.
			className={cn('flex flex-col gap-6 pt-1 md:gap-8 md:pt-0 lg:-mt-3 lg:gap-9', model.activeSession && 'max-lg:pb-[4.5rem]')}
		>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<DashboardGreeting name={firstName} />
				{showHeaderUpload ? (
					// Phones upload from the tab bar's raised button, so this one only exists from `lg`.
					<UploadTicketDialog
						variant='outline'
						className={cn(SECONDARY_ACTION, 'hidden lg:inline-flex')}
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
				<GroupsSectionCard groups={model.groups} />
				<ReceiptsSectionCard receipts={model.receipts} />
				{/* On two columns the third card takes the whole row instead of leaving a half-empty one. */}
				<div className='sm:col-span-2 xl:col-span-1'>
					<HistorySectionCard trips={model.trips} />
				</div>
			</div>

			{/* PageContainer's bottom padding clears the pill, which floats above the phone tab bar. */}
			{model.activeSession ? <MobileSessionBar session={model.activeSession} /> : null}
		</div>
	)
}
