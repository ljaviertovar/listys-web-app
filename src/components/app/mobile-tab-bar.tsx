'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { UploadTicketDialog } from '@/components/features/tickets'
import { MOBILE_TAB_ITEMS } from '@/data/constants'
import { useActiveSessionStore } from '@/stores/active-session'
import { cn } from '@/utils'
import { checkIsActive } from './sidebar/helpers/check-is-active'
import { useTripNavigation } from './trip-navigation'

/** The screens of a list and of a running trip belong to the Lists tab although their paths start elsewhere. */
export function isListsSection(pathname: string) {
	return /^\/(base-lists|shopping)\//.test(pathname)
}

/**
 * The pill of the current tab, filled and inked with the colour of its entity (design A2): the same tones as the page header
 * tile and the dashboard rows. The dashboard has no entity, so its pill is neutral.
 */
const CURRENT_TONES: Record<string, string> = {
	'/dashboard': 'bg-border text-foreground dark:bg-accent',
	'/shopping-lists': 'bg-entity-list text-entity-list-on',
	'/tickets': 'bg-entity-receipt text-entity-receipt-on',
	'/trips': 'bg-entity-trip text-entity-trip-on',
}

/**
 * One destination of the bar; the current one is a pill in the colour of its entity, with no extra marker (design A2 mobile).
 * Every tab is as tall as the current one, so the bar keeps its height on pages where none of the four is current. `dot` is a
 * live state (a trip is running): it is aria-hidden and `status` carries its meaning in the link name.
 */
function Tab({
	item,
	isActive,
	dot,
	status,
}: {
	item: (typeof MOBILE_TAB_ITEMS)[number]
	isActive: boolean
	dot?: boolean
	status?: string
}) {
	return (
		<Link
			href={item.url}
			aria-current={isActive ? 'page' : undefined}
			data-testid={`mobile-tab-${item.url.slice(1)}`}
			data-active={isActive}
			className={cn(
				'flex min-h-14 flex-col items-center justify-start gap-1 rounded-xl pt-2 text-xs leading-none transition-colors',
				'focus-ring',
				isActive
					? cn('font-semibold', CURRENT_TONES[item.url] ?? 'bg-accent text-accent-foreground')
					: 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
			)}
		>
			<span className='relative block size-6'>
				<HugeiconsIcon
					icon={item.icon}
					strokeWidth={1.5}
					aria-hidden='true'
					className='size-6'
				/>
				{dot ? (
					<span
						aria-hidden='true'
						data-testid={`mobile-tab-${item.url.slice(1)}-dot`}
						className='absolute -top-0.5 -right-1 size-2 rounded-full border-[1.5px] border-card bg-feedback-success'
					/>
				) : null}
			</span>
			<span>
				{item.title}
				{status ? <span className='sr-only'>, {status}</span> : null}
			</span>
		</Link>
	)
}

/**
 * Phones only (hidden from `lg`, where the sidebar takes over): the app's navigation as a bottom tab bar, with the
 * receipt upload as a raised action in the middle slot. It stays pinned to the viewport while page content scrolls.
 */
export function MobileTabBar() {
	const pathname = usePathname()
	const navigation = useTripNavigation()
	const tripSection = navigation?.route?.pathname === pathname ? navigation.route.section : null
	const tripRunning = useActiveSessionStore(s => s.activeSession !== null)
	const [dashboard, lists, receipts, history] = MOBILE_TAB_ITEMS

	const tab = (item: (typeof MOBILE_TAB_ITEMS)[number]) => (
		<Tab
			item={item}
			isActive={
				checkIsActive(pathname, item, true) ||
				(item === lists && (pathname.startsWith('/shopping/') ? tripSection === 'lists' : isListsSection(pathname))) ||
				(item === history && pathname.startsWith('/shopping/') && tripSection === 'trips')
			}
			dot={item === history && tripRunning}
			status={item === history && tripRunning ? 'shopping in progress' : undefined}
		/>
	)

	return (
		<nav
			aria-label='Main'
			data-testid='mobile-tab-bar'
			className='fixed inset-x-0 bottom-0 z-40 grid shrink-0 grid-cols-5 items-start bg-card px-2 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-1px_0_rgba(15,23,42,0.06),0_-12px_24px_-22px_rgba(15,23,42,0.4)] lg:hidden'
		>
			{tab(dashboard)}
			{tab(lists)}
			<div className='flex flex-col items-center'>
				<UploadTicketDialog
					trigger={
						<Button
							variant='default'
							ring={tripRunning ? 'surface' : 'none'}
							size='icon-2xl'
							aria-label='Upload a receipt'
							data-testid='mobile-tab-upload'
							// The ring in the bar colour makes the overlap with the session bar read as a cut-out, only while a trip runs.
							className='-mt-5'
						>
							<HugeiconsIcon
								icon={Upload06Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-5.5'
							/>
						</Button>
					}
				/>
				{/* On the same baseline as the labels of the other four tabs. */}
				<span className='mt-2 text-xs leading-none font-medium text-muted-foreground dark:text-entity-list-on'>
					Upload
				</span>
			</div>
			{tab(receipts)}
			{tab(history)}
		</nav>
	)
}
