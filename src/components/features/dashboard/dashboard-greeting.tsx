'use client'

import { useSyncExternalStore } from 'react'
import { Moon02Icon, Sun03Icon, SunriseIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { PageHeader } from '@/components/app'

interface Props {
	name: string
}

const subscribe = () => () => {}
// Whole minutes keep the snapshot stable between renders; `null` on the server avoids guessing the visitor's timezone.
const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000)
const getServerSnapshot = () => null

function greetingFor(hour: number) {
	if (hour < 12) return { label: 'Good morning', icon: SunriseIcon }
	if (hour < 18) return { label: 'Good afternoon', icon: Sun03Icon }
	return { label: 'Good evening', icon: Moon02Icon }
}

/** Personal greeting with a time-of-day glyph, resolved in the visitor's timezone without adding a date badge. */
export function DashboardGreeting({ name }: Props) {
	const minutes = useSyncExternalStore(subscribe, getMinuteSnapshot, getServerSnapshot)
	const period = minutes === null ? null : greetingFor(new Date(minutes * 60_000).getHours())

	return (
		<PageHeader
			testId='dashboard-greeting'
			title={
				<span className='flex min-w-0 items-center gap-2'>
				{period ? <HugeiconsIcon icon={period.icon} strokeWidth={1.5} aria-hidden='true' className='size-6 shrink-0 text-primary' /> : null}
				{period?.label ?? 'Hi'}, {name}
				</span>
			}
			desc="Here's what's happening with your household's shopping today."
		/>
	)
}
