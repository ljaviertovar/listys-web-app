import Link from 'next/link'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
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
			<div className='flex w-full max-w-xl flex-col gap-4 px-[22px] pt-40 pb-[26px] sm:p-8 md:gap-[18px] md:px-10 md:py-9'>
				{/* Someone with no lists has never had a session, so saying there is none adds nothing: the hero just asks for a receipt. */}
				{hasLists ? (
					<span className='inline-flex w-fit items-center gap-[7px] rounded-full bg-white/12 px-[11px] py-[5px] text-[12.5px] leading-[1.2] font-semibold text-slate-200'>
						<span className='size-[7px] rounded-full bg-slate-400' />
						No shopping session in progress
					</span>
				) : null}

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-no-session-title'
						className='font-display text-[30px] leading-[1.17] font-bold tracking-[-0.025em] text-balance md:text-[32px] lg:text-[40px] lg:leading-[1.1]'
					>
						{hasLists ? 'Ready to go shopping?' : 'Start with a receipt'}
					</h2>
					<p
						data-testid='dashboard-no-session-description'
						className='text-[15px] leading-[1.55] text-slate-300 md:text-base'
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
						<span className='font-mono text-[11px] leading-[1.2] font-medium tracking-widest text-slate-400 uppercase'>
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
										<span className='font-medium text-slate-400'>· {describeList(list)}</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{!hasLists ? (
					<UploadTicketDialog
						size='xl'
						className={cn(
							'mt-1 w-full rounded-[12px] md:w-auto md:self-start md:h-[52px] md:gap-2.5 md:rounded-[12px] md:px-7 md:font-bold md:shadow-[0_14px_28px_-14px_rgba(37,99,235,0.85)] md:transition-[transform,box-shadow] md:duration-150 md:hover:-translate-y-px md:hover:shadow-[0_18px_32px_-14px_rgba(37,99,235,0.9)] md:motion-reduce:transition-none md:motion-reduce:hover:translate-y-0',
						)}
					/>
				) : startTarget ? (
					<StartShoppingDialog
						baseListId={startTarget.id}
						baseListName={startTarget.name}
						itemsCount={startTarget.itemsCount}
						size='xl'
						className={cn('mt-1 w-full md:w-auto', HERO_CTA)}
					>
						Start shopping
						<HugeiconsIcon
							icon={ArrowRight02Icon}
							strokeWidth={2}
							className='size-[18px]'
						/>
					</StartShoppingDialog>
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
								icon={ArrowRight02Icon}
								strokeWidth={2}
								className='size-[18px]'
							/>
						</Link>
					</Button>
				)}

				{!hasLists ? (
					<p className='font-mono text-xs leading-[1.3] font-medium tracking-[0.04em] text-slate-400'>
						1–5 photos · you review every item before it is saved
					</p>
				) : null}

				{lastTrip ? (
					<p className='font-mono text-xs leading-[1.3] font-medium tracking-[0.04em] text-slate-400'>
						Last shopping session · {lastTrip.listName} · {lastTrip.dateLabel}
						{lastTrip.total !== null ? ` · ${formatCurrency(lastTrip.total)}` : ''}
					</p>
				) : null}
			</div>
		</HeroSurface>
	)
}
