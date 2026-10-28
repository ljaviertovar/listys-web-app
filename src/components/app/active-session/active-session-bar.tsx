'use client'

import { usePathname } from 'next/navigation'

import { MOBILE_SESSION_BAR_CLEARANCE } from '@/components/app/helpers/mobile-tab-bar-layout'
import { useActiveSessionStore } from '@/stores/active-session'
import { cn } from '@/utils'

import { useSessionProgress } from './hooks/use-session-progress'
import { SessionBar } from './session-bar'

/** The route of a running session's own screen; the bar is the way back there, so it is not shown on it. */
export function isSessionScreen(pathname: string, sessionId: string) {
	return pathname === `/shopping/${sessionId}` || pathname.startsWith(`/shopping/${sessionId}/`)
}

/**
 * The shortcut back to the running shopping session, on every phone screen except the session itself. It needs the
 * session in the store (loaded once by `ActiveSessionInit`); the spacer keeps the end of a page from sitting under it.
 */
export function ActiveSessionBar() {
	const pathname = usePathname()
	const session = useActiveSessionStore(s => s.activeSession)
	const otherCount = useActiveSessionStore(s => s.otherCount)
	const progress = useSessionProgress(session?.id ?? null, pathname)

	if (!session || isSessionScreen(pathname, session.id)) return null

	return (
		<>
			<SessionBar
				id={session.id}
				name={session.name || 'Current shopping'}
				progress={progress}
				otherCount={otherCount}
			/>
			<div
				aria-hidden='true'
				data-testid='active-session-bar-spacer'
				className={cn('shrink-0 lg:hidden', MOBILE_SESSION_BAR_CLEARANCE)}
			/>
		</>
	)
}
