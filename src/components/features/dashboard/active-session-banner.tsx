import Link from 'next/link'
import { ArrowRight02Icon, UserStar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActiveShoppingBadge } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils'
import { HeroCollaborators } from './hero-collaborators'
import { HeroSurface } from './hero-surface'
import { FOCUS_RING, HERO_CTA } from './helpers/dashboard-styles'
import { pluralize, type ActiveSessionSummary } from './helpers/build-dashboard-model'

interface Props {
	session: ActiveSessionSummary
	/** True when the session belongs to someone else and was shared with the current user. */
	isGuest?: boolean
}

/** Hero of the dashboard while a shopping session is running: where you are, how far along, and one way back in. */
export function ActiveSessionBanner({ session, isGuest = false }: Props) {
	const origin = [session.groupName, session.listName].filter(Boolean).join(' › ')
	const isShared = session.collaborators.length > 0

	return (
		<HeroSurface
			testId='dashboard-active-session-banner'
			labelledBy='dashboard-active-session-title'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 px-[22px] pt-40 md:pt-6 pb-[26px] sm:p-8 md:gap-[18px] md:px-10 md:py-9'>
				<div className='flex flex-wrap items-center gap-2.5'>
					<ActiveShoppingBadge
						tone='on-dark'
						label='Shopping now'
						className='h-auto gap-[7px] border-0 bg-white/12 px-[11px] py-[5px] text-[12.5px] leading-[1.2] [&>span:first-child]:size-[7px]'
					/>
					{origin ? <span className='text-[13px] leading-tight text-slate-300'>{origin}</span> : null}
				</div>

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-active-session-title'
						className='font-display text-[30px] leading-[1.17] font-bold tracking-[-0.025em] text-balance md:text-[32px] lg:text-[40px] lg:leading-[1.1]'
					>
						{session.name}
					</h2>
					<p className='text-[15px] leading-[1.55] text-slate-300 md:text-base'>
						{session.total === 0
							? 'This shopping session has no items yet. Add some to get started.'
							: `${pluralize(session.checked, 'item')} in the cart, ${session.remaining} to go. Pick up right where you left off.`}
					</p>
				</div>

				<div className='flex max-w-sm flex-col gap-2'>
					<Progress
						value={session.progress}
						aria-label='Items collected in this shopping session'
						className='h-2 bg-white/15'
						indicatorClassName='bg-linear-to-r from-blue-400 to-blue-500'
					/>
					<span className='font-mono text-[12.5px] leading-[1.3] text-slate-300 tabular-nums'>
						{session.checked} of {pluralize(session.total, 'item')} · {session.progress}%
					</span>
				</div>

				<Button
					asChild
					size='xl'
					rounded='xl'
					className={cn('mt-1 w-full md:w-auto', HERO_CTA)}
				>
					<Link
						href={`/shopping/${session.id}`}
						data-testid='dashboard-continue-shopping'
						className={FOCUS_RING}
					>
						Continue shopping
						<HugeiconsIcon
							icon={ArrowRight02Icon}
							strokeWidth={2}
							className='size-[18px]'
						/>
					</Link>
				</Button>

				{isGuest ? (
					<Badge
						variant='pending'
						className='w-fit gap-2'
					>
						<HugeiconsIcon
							icon={UserStar02Icon}
							className='size-3'
						/>
						Shared with you
					</Badge>
				) : isShared ? (
					<HeroCollaborators
						collaborators={session.collaborators}
						caption={`Shared with ${pluralize(session.collaborators.length, 'person', 'people')}`}
					/>
				) : null}
			</div>
		</HeroSurface>
	)
}
