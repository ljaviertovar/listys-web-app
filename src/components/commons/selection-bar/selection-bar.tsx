'use client'

import type { ReactNode } from 'react'

import {
	ABOVE_MOBILE_ACTION_BAR,
	ABOVE_MOBILE_ACTION_BAR_WITH_SESSION,
} from '@/components/app/helpers/mobile-tab-bar-layout'
import { useActiveSessionStore } from '@/stores/active-session'
import { cn } from '@/utils'

interface SelectionBarProps {
	/** What the bar says: how many things are picked, and one quiet line under it. */
	summary: ReactNode
	/** The actions on the picked things, already styled as buttons. */
	children: ReactNode
	ariaLabel: string
	/** `card` sticks to the bottom of the card it is rendered in; `panel` is the plain footer of a list. */
	placement?: 'card' | 'panel'
	busy?: boolean
	testId: string
}

/**
 * The dark pill for a selection. On phones it floats above the tab bar's raised upload button (and above the
 * active-session bar when one is showing) so it never covers them; from `lg` it sticks to the bottom of its card.
 */
export function SelectionBar({ summary, children, ariaLabel, placement = 'card', busy = false, testId }: SelectionBarProps) {
	const hasSessionBar = useActiveSessionStore(s => s.activeSession !== null)

	return (
		<div
			data-testid={testId}
			role='region'
			aria-label={ariaLabel}
			aria-busy={busy || undefined}
			className={cn(
				'fixed inset-x-3 z-40 flex min-h-14 items-center gap-2 rounded-full bg-slate-900 py-2 pr-2 pl-4 text-white shadow-[0_16px_32px_-12px_rgba(21,23,27,0.5)]',
				hasSessionBar ? ABOVE_MOBILE_ACTION_BAR_WITH_SESSION : ABOVE_MOBILE_ACTION_BAR,
				'lg:z-10 lg:rounded-t-none lg:px-5 lg:py-3 lg:shadow-none',
				placement === 'card'
					? 'lg:sticky lg:inset-x-0 lg:bottom-0 lg:-mx-3.5 lg:-mb-1.5 lg:mt-2 lg:rounded-b-3xl'
					: 'lg:static lg:m-0 lg:shrink-0 lg:rounded-none',
			)}
		>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>{summary}</div>
			{children}
		</div>
	)
}
