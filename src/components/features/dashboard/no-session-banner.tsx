import Link from 'next/link'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { StartShoppingDialog } from '@/components/features/base-lists'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/utils'
import { HeroSurface } from './hero-surface'
import { FOCUS_RING, HERO_CTA, QUICK_START_CHIP } from './helpers/dashboard-styles'
import { pluralize, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	quickStart: DashboardModel['quickStart']
	/** The list the hero's button starts; null while no list has items. */
	startTarget: DashboardModel['startTarget']
	lastTrip: DashboardModel['lastTrip']
	/** Whether the user already owns at least one list; new users are pointed at a receipt instead. */
	hasLists: boolean
}

function describeList(list: NonNullable<Props['startTarget']>) {
	return [list.groupName, pluralize(list.itemsCount, 'item')].filter(Boolean).join(' · ')
}

/**
 * Hero of the dashboard when no shopping session is running. One blue button does the obvious thing: it starts the list
 * that is most due (after the usual confirmation), or, for an account without lists, uploads a receipt. The other lists
 * are shortcuts to open underneath.
 */
export function NoSessionBanner({ quickStart, startTarget, lastTrip, hasLists }: Props) {
	const otherLists = quickStart.filter(list => list.id !== startTarget?.id)

	return (
		<HeroSurface
			testId='dashboard-no-session-banner'
			labelledBy='dashboard-no-session-title'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 p-5 sm:p-8 md:gap-5 md:p-10'>
				{/* Someone with no lists has never had a session, so saying there is none adds nothing: the hero just asks for a receipt. */}
				{hasLists ? (
					<span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs leading-[1.2] font-semibold text-slate-100'>
						<span className='size-2 rounded-full bg-slate-400' />
						No shopping session in progress
					</span>
				) : null}

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-no-session-title'
						className='font-display text-[clamp(24px,3vw,32px)] leading-[1.16] font-bold tracking-tight text-balance'
					>
						{hasLists ? 'Ready to go shopping?' : 'Start with a receipt'}
					</h2>
					<p
						data-testid='dashboard-no-session-description'
						className='text-[15px] leading-[1.6] text-slate-300'
					>
						{!hasLists
							? 'Upload one receipt and Listys turns it into a list you can reuse every time you shop.'
							: startTarget
								? `Start “${startTarget.name}” (${describeList(startTarget)}). Your list stays as it is; the session works on a copy.`
								: 'Your lists have no items yet. Add some to a list and it is ready to shop.'}
					</p>
				</div>

				{hasLists && otherLists.length > 0 ? (
					<div className='flex flex-col gap-2'>
						<span className='font-mono text-[11px] leading-[1.2] font-semibold tracking-widest text-slate-300 uppercase'>
							Your lists
						</span>
						<ul className='flex flex-wrap gap-2'>
							{otherLists.map(list => (
								<li key={list.id}>
									<Link
										href={`/base-lists/${list.id}/edit`}
										data-testid={`dashboard-quick-start-${list.id}`}
										className={cn(
											'inline-flex items-center rounded-full border border-white/20 bg-white/10 font-semibold transition-colors duration-150 hover:bg-white/20',
											QUICK_START_CHIP,
											FOCUS_RING,
										)}
									>
										{list.name}
										<span className='font-medium text-slate-300'>· {describeList(list)}</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{!hasLists ? (
					<UploadTicketDialog className={cn('mt-1 w-full md:w-auto', HERO_CTA)} />
				) : startTarget ? (
					<StartShoppingDialog
						baseListId={startTarget.id}
						baseListName={startTarget.name}
						itemsCount={startTarget.itemsCount}
						size='xl'
						className={cn('mt-1 w-full md:w-auto', HERO_CTA)}
					/>
				) : (
					<Button
						asChild
						size='xl'
						rounded='xl'
						className={cn('mt-1 w-full md:w-auto', HERO_CTA)}
					>
						<Link
							href='/shopping-lists'
							data-testid='dashboard-no-session-cta'
							className={FOCUS_RING}
						>
							Open your lists
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
							/>
						</Link>
					</Button>
				)}

				{!hasLists ? (
					<p className='font-mono text-xs leading-[1.55] font-medium tracking-[0.01em] text-slate-300'>
						1–5 photos · you review every item before it is saved
					</p>
				) : null}

				{lastTrip ? (
					<p className='font-mono text-xs leading-[1.55] font-medium tracking-[0.01em] text-slate-300'>
						Last shopping session · {lastTrip.listName} · {lastTrip.dateLabel}
						{lastTrip.total !== null ? ` · ${formatCurrency(lastTrip.total)}` : ''}
					</p>
				) : null}
			</div>
		</HeroSurface>
	)
}
