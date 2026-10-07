'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { SIDEBAR_DATA } from '@/data/constants'
import useActiveSessionStore from '@/stores/active-session'
import { cn } from '@/utils'
import { checkIsActive } from './sidebar/helpers/check-is-active'
import AppSidebarFooter from './sidebar/app-sidebar-footer'
import { MobileNavAccount } from './mobile-nav-account'
import { MobileNavSessionCard } from './mobile-nav-session-card'
import { useMobileNavSummary } from './hooks/use-mobile-nav-summary'

interface Props {
	open: boolean
	onNavigate: () => void
}

/** Count pills of the reference menu: groups are neutral, receipts still waiting for a list are amber (they need a look). */
const COUNT_STYLES = {
	neutral: 'bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground',
	waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
} as const

/**
 * Everything inside the mobile menu below its header: the same sections as the sidebar, in the same order, with counts
 * next to the two that have something to count, then the running session, the account and the author credit.
 */
export function MobileNavPanel({ open, onNavigate }: Props) {
	const pathname = usePathname()
	const activeSession = useActiveSessionStore(s => s.activeSession)
	const summary = useMobileNavSummary(open, activeSession?.id ?? null)

	const counts: Record<string, { value: number | null; style: keyof typeof COUNT_STYLES; label: (n: number) => string }> = {
		'/shopping-lists': { value: summary.groupsCount, style: 'neutral', label: n => `${n} ${n === 1 ? 'group' : 'groups'}` },
		'/tickets': { value: summary.receiptsWaiting, style: 'waiting', label: n => `${n} ${n === 1 ? 'receipt' : 'receipts'} waiting` },
	}

	return (
		<>
			<nav
				aria-label='Main'
				data-testid='mobile-nav-links'
				className='flex flex-1 flex-col gap-6 overflow-y-auto px-3 pt-5 pb-3'
			>
				{SIDEBAR_DATA.navGroups.map(group => (
					<div
						key={group.title}
						className='flex flex-col gap-0.5'
					>
						<span className='px-3 pb-2 text-[11px] leading-none font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-muted-foreground'>
							{group.title}
						</span>
						{group.items.map(item => {
							if (!item.url) return null
							const isActive = checkIsActive(pathname, item)
							const count = counts[item.url]
							return (
								<Link
									key={item.url}
									href={item.url}
									onClick={onNavigate}
									aria-current={isActive ? 'page' : undefined}
									data-active={isActive}
									className={cn(
										'relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-foreground dark:text-foreground/80 dark:hover:bg-muted',
										isActive &&
											'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-2.5 before:-left-2 before:w-[3px] before:rounded-r-full before:bg-primary hover:bg-primary/10 hover:text-primary',
									)}
								>
									{item.icon ? (
										<HugeiconsIcon
											icon={item.icon}
											strokeWidth={2}
											className={cn('size-5 shrink-0', isActive ? 'text-primary' : 'text-slate-500 dark:text-muted-foreground')}
										/>
									) : null}
									{item.title}
									{count?.value ? (
										<span
											aria-label={count.label(count.value)}
											data-testid={`mobile-nav-count-${item.url.slice(1)}`}
											className={cn(
												'ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px] text-xs font-semibold tabular-nums',
												COUNT_STYLES[count.style],
											)}
										>
											{count.value}
										</span>
									) : null}
								</Link>
							)
						})}
					</div>
				))}
			</nav>

			<div className='mt-auto flex shrink-0 flex-col gap-3 p-3'>
				{activeSession ? (
					<MobileNavSessionCard
						sessionId={activeSession.id}
						name={activeSession.name ?? ''}
						progress={summary.progress}
						onNavigate={onNavigate}
					/>
				) : null}
				{summary.user ? (
					<MobileNavAccount
						user={summary.user}
						onNavigate={onNavigate}
					/>
				) : null}
				<AppSidebarFooter className='px-2 pt-0 pb-1 text-xs text-slate-500' />
			</div>
		</>
	)
}
