import Link from 'next/link'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/utils'
import { FOCUS_RING, HERO_CTA, QUICK_START_CHIP } from './helpers/dashboard-styles'
import { pluralize, type DashboardModel } from './helpers/build-dashboard-model'

interface Props {
	quickStart: DashboardModel['quickStart']
	lastTrip: DashboardModel['lastTrip']
	/** Whether the user already owns at least one list; new users are pointed at a receipt instead. */
	hasLists: boolean
}

/** Hero of the dashboard when no shopping session is running: the next one is a tap away, or a receipt gets the user started. */
export function NoSessionBanner({ quickStart, lastTrip, hasLists }: Props) {
	return (
		<section
			data-testid='dashboard-no-session-banner'
			aria-labelledby='dashboard-no-session-title'
			// Ink (#0F172A) scrim over the photo so the text keeps AA contrast; 24px radius as in A1.
			className='relative isolate flex min-h-[330px] items-center overflow-hidden rounded-3xl bg-[linear-gradient(90deg,rgba(15,23,42,.95)_0%,rgba(15,23,42,.88)_46%,rgba(15,23,42,.45)_100%),url(/images/landing/close-bg.jpg)] bg-cover bg-center text-white max-md:bg-[linear-gradient(180deg,rgba(15,23,42,.93)_0%,rgba(15,23,42,.86)_100%),url(/images/landing/close-bg.jpg)]'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 p-5 sm:p-8 md:gap-5 md:p-10'>
				<span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs leading-[1.2] font-semibold text-slate-100'>
					<span className='size-2 rounded-full bg-slate-400' />
					No shopping session in progress
				</span>

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-no-session-title'
						className='font-display text-[clamp(24px,3vw,32px)] leading-[1.16] font-bold tracking-tight text-balance'
					>
						{hasLists ? 'Ready to go shopping?' : 'Start with a receipt'}
					</h2>
					<p className='text-[15px] leading-[1.6] text-slate-300'>
						{hasLists
							? 'Pick a list from one of your groups. Your list stays as it is; the session works on a copy.'
							: 'Upload one receipt and Listys turns it into a list you can reuse every time you shop.'}
					</p>
				</div>

				{hasLists && quickStart.length > 0 ? (
					<div className='flex flex-col gap-2'>
						<span className='font-mono text-[11px] leading-[1.2] font-semibold tracking-widest text-slate-300 uppercase'>
							Quick start
						</span>
						<ul className='flex flex-wrap gap-2'>
							{quickStart.map(list => (
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
										<span className='font-medium text-slate-300'>
											· {[list.groupName, pluralize(list.itemsCount, 'item')].filter(Boolean).join(' · ')}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : null}

				<Button
					asChild
					size='xl'
					rounded='xl'
					className={cn('mt-1 w-full md:w-auto', HERO_CTA)}
				>
					<Link
						href={hasLists ? '/shopping-lists' : '/tickets'}
						data-testid='dashboard-no-session-cta'
						className={FOCUS_RING}
					>
						{hasLists ? 'Start shopping' : 'Upload Receipt'}
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
						/>
					</Link>
				</Button>

				{lastTrip ? (
					<p className='font-mono text-xs leading-[1.55] font-medium tracking-[0.01em] text-slate-300'>
						Last shopping session · {lastTrip.listName} · {lastTrip.dateLabel}
						{lastTrip.total !== null ? ` · ${formatCurrency(lastTrip.total)}` : ''}
					</p>
				) : null}
			</div>
		</section>
	)
}
