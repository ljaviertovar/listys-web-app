'use client'

import { useSyncExternalStore } from 'react'
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

/**
 * Personal greeting with today's date above it as plain text, resolved in the visitor's own timezone once the page is on
 * the client. The date is deliberately not a coloured pill: amber means "waiting" on this screen, and a calm date in that
 * colour read as a warning.
 */
export function DashboardGreeting({ name }: Props) {
	const minutes = useSyncExternalStore(subscribe, getMinuteSnapshot, getServerSnapshot)
	const now = minutes === null ? null : new Date(minutes * 60_000)

	const dateLabel = now
		? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
		: ''

	return (
		<div
			data-testid='dashboard-greeting'
			className='flex flex-col items-start gap-1'
		>
			{/* Always rendered so the page does not shift when the date resolves on the client. */}
			<p
				data-testid='dashboard-date'
				className={cn('text-[13px] leading-[1.55] font-medium text-muted-foreground', !now && 'invisible')}
			>
				{dateLabel || 'Today'}
			</p>
			<h1 className='font-display text-[clamp(24px,3vw,32px)] leading-[1.16] font-bold tracking-tight text-balance'>
				{now ? `${greetingFor(now.getHours())}, ${name}` : `Hi, ${name}`}
			</h1>
		</div>
	)
}
