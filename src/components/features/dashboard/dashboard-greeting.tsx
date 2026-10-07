'use client'

import { useSyncExternalStore } from 'react'
import { Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils'

interface Props {
	name: string
}

const subscribe = () => () => {}
// Whole minutes keep the snapshot stable between renders; `null` on the server avoids guessing the visitor's timezone.
const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000)
const getServerSnapshot = () => null

function greetingFor(hour: number) {
	if (hour < 12) return 'Good morning'
	if (hour < 18) return 'Good afternoon'
	return 'Good evening'
}

/** Personal greeting and today's date, resolved in the visitor's own timezone once the page is on the client. */
export function DashboardGreeting({ name }: Props) {
	const minutes = useSyncExternalStore(subscribe, getMinuteSnapshot, getServerSnapshot)
	const now = minutes === null ? null : new Date(minutes * 60_000)

	const dateLabel = now
		? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
		: ''

	return (
		<div
			data-testid='dashboard-greeting'
			className='flex flex-col items-start gap-2'
		>
			{/* Always rendered so the page does not shift when the date resolves on the client. */}
			<Badge
				variant='pending'
				data-testid='dashboard-date-badge'
				className={cn(
					'h-8 gap-2 border-amber-100 bg-amber-50 px-3 text-[13px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
					!now && 'invisible',
				)}
			>
				<HugeiconsIcon
					icon={Sun03Icon}
					strokeWidth={1.5}
					className='size-4 text-amber-500'
				/>
				{dateLabel || 'Today'}
			</Badge>
			<h1 className='font-display text-[clamp(24px,3vw,32px)] leading-[1.16] font-bold tracking-tight text-balance'>
				{now ? `${greetingFor(now.getHours())}, ${name}` : `Hi, ${name}`}
			</h1>
			<p className='text-[15px] leading-[1.6] text-muted-foreground'>
				Here&apos;s what&apos;s happening with your household&apos;s shopping today.
			</p>
		</div>
	)
}
