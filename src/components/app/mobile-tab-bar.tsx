'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { UploadTicketDialog } from '@/components/features/tickets'
import { MOBILE_TAB_ITEMS } from '@/data/constants'
import { cn } from '@/utils'
import { checkIsActive } from './sidebar/helpers/check-is-active'

const TAB_FOCUS_RING =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

/**
 * One destination of the bar; the current one is blue, bold, on a grey pill and carries a dot under its label (design A1 mobile). Every
 * tab is as tall as the current one, so the bar keeps its height on pages where none of the four is current.
 */
function Tab({ item, isActive }: { item: (typeof MOBILE_TAB_ITEMS)[number]; isActive: boolean }) {
	return (
		<Link
			href={item.url}
			aria-current={isActive ? 'page' : undefined}
			data-testid={`mobile-tab-${item.url.slice(1)}`}
			data-active={isActive}
			className={cn(
				'flex min-h-11 flex-col items-center justify-start gap-1 rounded-[12px] pt-1.5 text-xs leading-none transition-colors',
				TAB_FOCUS_RING,
				// The current tab sits on the secondary-button surface (#E9ECF0) with blue text, like any selected option.
				isActive ? 'bg-[#E9ECF0] font-semibold text-blue-700 dark:bg-muted dark:text-blue-300' : 'font-medium text-slate-500 hover:text-foreground',
			)}
		>
			<HugeiconsIcon
				icon={item.icon}
				strokeWidth={1.5}
				aria-hidden='true'
				className='size-5'
			/>
			<span>{item.title}</span>
			{isActive ? (
				<span
					aria-hidden='true'
					className='size-1 rounded-full bg-primary'
				/>
			) : null}
		</Link>
	)
}

/**
 * Phones only (hidden from `lg`, where the sidebar takes over): the app's navigation as a bottom tab bar, with the
 * receipt upload as a raised action in the middle slot. It stays pinned to the viewport while page content scrolls.
 */
export function MobileTabBar() {
	const pathname = usePathname()
	const [dashboard, lists, receipts, history] = MOBILE_TAB_ITEMS

	const tab = (item: (typeof MOBILE_TAB_ITEMS)[number]) => (
		<Tab
			item={item}
			isActive={checkIsActive(pathname, item, true)}
		/>
	)

	return (
		<nav
			aria-label='Main'
			data-testid='mobile-tab-bar'
				className='fixed inset-x-0 bottom-0 z-40 grid shrink-0 grid-cols-5 items-start bg-card px-2 pt-1 pb-[max(1.125rem,env(safe-area-inset-bottom))] shadow-[0_-1px_0_rgba(15,23,42,0.06),0_-12px_24px_-22px_rgba(15,23,42,0.4)] lg:hidden'
		>
			{tab(dashboard)}
			{tab(lists)}
			<div className='flex justify-center'>
				<UploadTicketDialog
					trigger={
						<Button
							rounded='2xl'
							aria-label='Upload a receipt'
							data-testid='mobile-tab-upload'
							className={cn(
							'-mt-5 size-12 border-0 shadow-[0_0_0_5px_var(--color-card),0_12px_24px_-10px_rgba(37,99,235,0.75)]',
								TAB_FOCUS_RING,
							)}
						>
							<HugeiconsIcon
								icon={Upload06Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-[22px]'
							/>
						</Button>
					}
				/>
			</div>
			{tab(receipts)}
			{tab(history)}
		</nav>
	)
}
