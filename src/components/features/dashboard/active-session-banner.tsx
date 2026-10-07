import Link from 'next/link'
import { ArrowRight01Icon, UserStar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActiveShoppingBadge } from '@/components/app'
import { CollaboratorAvatars } from '@/components/features/sharing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils'
import { FOCUS_RING, HERO_CTA, HERO_CTA_ID } from './helpers/dashboard-styles'
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
		<section
			data-testid='dashboard-active-session-banner'
			aria-labelledby='dashboard-active-session-title'
			// Ink (#0F172A) scrim over the photo so the text keeps AA contrast; 24px radius as in A1.
			className='relative isolate flex min-h-0 items-center overflow-hidden rounded-3xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-18px_rgba(15,23,42,0.28)] md:min-h-[330px] bg-[linear-gradient(90deg,rgba(15,23,42,.95)_0%,rgba(15,23,42,.88)_46%,rgba(15,23,42,.45)_100%),url(/images/landing/close-bg.jpg)] bg-cover bg-center text-white max-md:bg-[linear-gradient(180deg,rgba(15,23,42,.93)_0%,rgba(15,23,42,.86)_100%),url(/images/landing/close-bg.jpg)]'
		>
			<div className='flex w-full max-w-xl flex-col gap-4 p-5 sm:p-8 md:gap-5 md:p-10'>
				<div className='flex flex-wrap items-center gap-3'>
					<ActiveShoppingBadge tone='on-dark' />
					{origin ? <span className='text-[13px] leading-[1.55] text-slate-300'>{origin}</span> : null}
				</div>

				<div className='flex flex-col gap-2'>
					<h2
						id='dashboard-active-session-title'
						className='font-display text-[clamp(24px,3vw,32px)] leading-[1.16] font-bold tracking-tight text-balance'
					>
						{session.name}
					</h2>
					<p className='text-[15px] leading-[1.6] text-slate-300'>
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
					<span className='text-[13px] leading-[1.55] text-slate-300 tabular-nums'>
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
						id={HERO_CTA_ID}
						data-testid='dashboard-continue-shopping'
						className={FOCUS_RING}
					>
						Continue shopping
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							strokeWidth={2}
						/>
					</Link>
				</Button>

				{isGuest || isShared ? (
					<div className='flex items-center gap-3 text-[13px] leading-[1.55] text-slate-300'>
						{isGuest ? (
							<Badge
								variant='pending'
								className='gap-2'
							>
								<HugeiconsIcon
									icon={UserStar02Icon}
									className='size-3'
								/>
								Shared with you
							</Badge>
						) : (
							<>
								<CollaboratorAvatars collaborators={session.collaborators} />
								<span>Shared with {pluralize(session.collaborators.length, 'person', 'people')}</span>
							</>
						)}
					</div>
				) : null}
			</div>
		</section>
	)
}
