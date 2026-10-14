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
				// A white pill with a hairline ring, not a tinted one (design A1).
				variant='outline'
				size='lg'
				data-testid='dashboard-date-badge'
				className={cn(!now && 'invisible')}
			>
				<HugeiconsIcon
					icon={Sun03Icon}
					strokeWidth={1.5}
					className='size-4 text-amber-600'
				/>
				{dateLabel || 'Today'}
			</Badge>
			<h1 className='font-display text-3xl leading-[1.17] font-bold tracking-tight text-balance lg:text-4xl'>
				{now ? `${greetingFor(now.getHours())}, ${name}` : `Hi, ${name}`}
			</h1>
			<p className='text-sm leading-normal text-slate-500 md:text-base dark:text-muted-foreground'>
				Here&apos;s what&apos;s happening with your household&apos;s shopping today.
			</p>
		</div>
	)
}
