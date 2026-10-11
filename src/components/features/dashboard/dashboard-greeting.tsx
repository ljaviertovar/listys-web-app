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

/** Personal greeting with today's date and a line of context, resolved in the visitor's own timezone once the page is on the client. */
export function DashboardGreeting({ name }: Props) {
	const minutes = useSyncExternalStore(subscribe, getMinuteSnapshot, getServerSnapshot)
	const now = minutes === null ? null : new Date(minutes * 60_000)

	// The visitor's own locale, so the date reads like the rest of their device; `undefined` is only reached on the client.
	const dateLabel = now ? new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now) : ''

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
					// A white pill with a hairline ring, not a tinted one (design A1).
					'h-7 gap-1.5 rounded-[8px] border-0 bg-card px-2.5 pl-2 text-[12.5px] text-slate-700 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.06)] dark:text-slate-200',
					!now && 'invisible',
				)}
			>
				<HugeiconsIcon
					icon={Sun03Icon}
					strokeWidth={1.5}
					className='size-4 text-amber-600'
				/>
				{dateLabel || 'Today'}
			</Badge>
			<h1 className='font-display text-[30px] leading-[1.17] font-bold tracking-[-0.025em] text-balance md:text-[32px] lg:text-[34px]'>
				{now ? `${greetingFor(now.getHours())}, ${name}` : `Hi, ${name}`}
			</h1>
			<p className='text-sm leading-normal text-slate-500 md:text-[15px] dark:text-muted-foreground'>
				Here&apos;s what&apos;s happening with your household&apos;s shopping today.
			</p>
		</div>
	)
}
