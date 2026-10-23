import Link from 'next/link'
import { ArrowRight02Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { StartShoppingDialog } from '@/components/features/base-lists'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils'
import { HeroSurface } from './hero-surface'
import { pluralize, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	quickStart: DashboardModel['quickStart']
	/** The list the hero's button starts; null while no list has items. */
	startTarget: DashboardModel['startTarget']
	/** The account's single empty list, if that is all it has; the hero then points straight at it. */
	addItemsTarget?: DashboardModel['addItemsTarget']
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
export function NoSessionBanner({ quickStart, startTarget, addItemsTarget = null, lastTrip, hasLists }: Props) {
	const otherLists = quickStart.filter(list => list.id !== startTarget?.id)

	return (
		<HeroSurface
			testId='dashboard-no-session-banner'
			labelledBy='dashboard-no-session-title'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 px-5.5 pt-40 pb-6.5 sm:p-8 md:gap-4.5 md:px-10 md:py-9'>
				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-no-session-title'
						className='font-display text-xl leading-[1.17] font-bold tracking-tight text-balance md:text-3xl'
					>
						{hasLists ? 'Ready to go shopping?' : 'Start with a receipt'}
					</h2>
					<p
						data-testid='dashboard-no-session-description'
						className='text-base leading-[1.55] text-slate-300'
					>
						{!hasLists
							? 'Upload one receipt and Listys turns it into a list you can reuse every time you shop.'
							: startTarget
								? `Start “${startTarget.name}” (${describeList(startTarget)}). Your list stays as it is; the session works on a copy.`
								: addItemsTarget
									? `Your list “${addItemsTarget.name}” has no items yet. Add some, or upload a receipt, and it is ready to shop.`
									: 'Your lists have no items yet. Add some to a list and it is ready to shop.'}
					</p>
				</div>

				{hasLists && otherLists.length > 0 ? (
					<div className='flex flex-col gap-2'>
						<span className='font-mono text-xs leading-[1.2] font-semibold tracking-widest text-slate-400 uppercase'>
							Your lists
						</span>
						<ul className='flex flex-wrap gap-2'>
							{otherLists.map(list => (
								<li key={list.id}>
									<Button
										asChild
										variant='on-dark'
										size='primary'
										rounded='full'
									>
										<Link
											href={`/base-lists/${list.id}/edit`}
											data-testid={`dashboard-quick-start-${list.id}`}
										>
											{list.name}
											<span className='font-medium text-slate-400'>· {describeList(list)}</span>
										</Link>
									</Button>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{!hasLists ? (
					<UploadTicketDialog
						variant='hero'
						size='hero-action'
						className='mt-1 w-full md:w-auto md:self-start'
					/>
				) : startTarget ? (
					<StartShoppingDialog
						baseListId={startTarget.id}
						baseListName={startTarget.name}
						itemsCount={startTarget.itemsCount}
						variant='hero'
						size='hero-action'
						className='mt-1 w-full md:w-auto md:self-start'
					>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={1.5}
							aria-hidden='true'
						/>
						Start Shopping
					</StartShoppingDialog>
				) : (
					<Button
						asChild
						variant='hero'
						size='hero-action'
						className='mt-1 w-full md:w-auto md:self-start'
					>
						<Link
							href={addItemsTarget ? `/base-lists/${addItemsTarget.id}/edit` : '/shopping-lists'}
							data-testid='dashboard-no-session-cta'
							className='focus-ring'
						>
							{addItemsTarget ? 'Add Items' : 'Open Your Lists'}
							<HugeiconsIcon
								icon={ArrowRight02Icon}
								strokeWidth={2}
								className='size-4.5'
							/>
						</Link>
					</Button>
				)}

				{!hasLists ? (
					<p className='font-mono text-xs leading-[1.3] font-medium text-slate-400'>
						1–5 photos · you review every item before it is saved
					</p>
				) : null}

				{lastTrip ? (
					<p className='font-mono text-xs leading-[1.3] font-medium text-slate-400'>
						Last shopping session · {lastTrip.listName} · {lastTrip.dateLabel}
						{lastTrip.total !== null ? ` · ${formatCurrency(lastTrip.total)}` : ''}
					</p>
				) : null}
			</div>
		</HeroSurface>
	)
}
