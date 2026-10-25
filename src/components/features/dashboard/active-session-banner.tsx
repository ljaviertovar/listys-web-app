import Link from 'next/link'
import { ArrowRight02Icon, UserStar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActiveShoppingBadge } from '@/components/app'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { HeroCollaborators } from './hero-collaborators'
import { HeroSurface } from './hero-surface'
import { pluralize, type ActiveSessionSummary } from './helpers/build-dashboard-model'

interface Props {
	session: ActiveSessionSummary
	/** True when the session belongs to someone else and was shared with the current user. */
	isGuest?: boolean
}

/** Hero of the dashboard while a shopping session is running: where you are, how far along, and one way back in. */
export function ActiveSessionBanner({ session, isGuest = false }: Props) {
	const origin = session.listName
	const isShared = session.collaborators.length > 0

	return (
		<HeroSurface
			testId='dashboard-active-session-banner'
			labelledBy='dashboard-active-session-title'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 px-5.5 pt-40 md:pt-6 pb-6.5 sm:p-8 md:gap-4.5 md:px-10 md:py-9'>
				<div className='flex flex-wrap items-center gap-2.5'>
					<ActiveShoppingBadge
						tone='on-dark'
						label='Shopping now'
						size='hero'
					/>
					{origin ? <span className='line-clamp-2 text-sm leading-tight text-slate-300'>{origin}</span> : null}
				</div>

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-active-session-title'
						className='font-display text-xl leading-[1.17] font-bold tracking-tight text-balance md:text-3xl'
					>
						{session.name}
					</h2>
					<p className='text-base leading-[1.55] text-slate-300'>
						{session.total === 0
							? 'This shopping session has no items yet. Add some to get started.'
							: `${pluralize(session.checked, 'item')} in the cart, ${session.remaining} to go. Pick up right where you left off.`}
					</p>
				</div>

				<div className='flex max-w-sm flex-col gap-2'>
					<Progress
						value={session.progress}
						aria-label='Items collected in this shopping session'
						size='md'
						tone='on-dark'
					/>
					<span className='font-mono text-xs leading-[1.3] font-medium text-slate-300 tabular-nums'>
						{session.checked} of {pluralize(session.total, 'item')} · {session.progress}%
					</span>
				</div>

				<Button
					asChild
					variant='hero'
					size='2xl'
					className='mt-1 w-full md:w-auto md:self-start'
				>
					<Link
						href={`/shopping/${session.id}`}
						data-testid='dashboard-continue-shopping'
						className='focus-ring'
					>
						Continue Shopping
						<HugeiconsIcon
							icon={ArrowRight02Icon}
							strokeWidth={2}
							className='size-4.5'
						/>
					</Link>
				</Button>

				{isGuest ? (
					<Badge variant='pending'>
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
