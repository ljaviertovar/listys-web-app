'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon, Cancel01Icon, CheckmarkCircle02Icon, ShoppingCart02Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { A1_TOOLBAR_BUTTON, FOCUS_RING } from '@/components/app/helpers/a1-surface'
import { ABOVE_MOBILE_TAB_BAR } from '@/components/app/helpers/mobile-tab-bar-layout'
import { cn } from '@/utils'

import { CancelSessionSheet } from './cancel-session-sheet'
import { CompleteSessionSheet } from './complete-session-sheet'

interface ShoppingSessionActionsProps {
	sessionId: string
	checked: number
	total: number
	/** Only the owner of the list can complete or cancel its session. */
	isOwner?: boolean
}

/**
 * What ends a shopping session. Phones get one small floating "Actions" button above the tab bar that opens its two
 * options; from `lg` they are two buttons beside the title. Both open the same sheets.
 */
export function ShoppingSessionActions({ sessionId, checked, total, isOwner = false }: ShoppingSessionActionsProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	const [completeOpen, setCompleteOpen] = useState(false)
	const [cancelOpen, setCancelOpen] = useState(false)

	if (!isOwner) return null

	return (
		<>
			<div
				data-testid='session-actions-inline'
				className='hidden items-center gap-2 lg:flex'
			>
				<Button
					variant='destructive-soft'
					onClick={() => setCancelOpen(true)}
					className={cn(A1_TOOLBAR_BUTTON)}
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-[18px]'
					/>
					Cancel Shopping
				</Button>
				<Button
					onClick={() => setCompleteOpen(true)}
					className={A1_TOOLBAR_BUTTON}
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-[18px]'
					/>
					Complete Shopping
				</Button>
			</div>

			<div
				data-testid='session-actions-floating'
				className={cn('fixed right-4 z-40 mb-4 lg:hidden', ABOVE_MOBILE_TAB_BAR)}
			>
				<DropdownMenu
					open={menuOpen}
					onOpenChange={setMenuOpen}
				>
					<DropdownMenuTrigger asChild>
						<button
							type='button'
							data-testid='session-actions-button'
							className={cn(
								'inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-card pr-3 pl-3.5 font-display text-sm font-semibold text-blue-700 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_14px_28px_-10px_rgba(15,23,42,0.45)] dark:text-blue-300',
								FOCUS_RING,
							)}
						>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={1.5}
								aria-hidden='true'
								className='size-[18px]'
							/>
							Actions
							<HugeiconsIcon
								icon={menuOpen ? ArrowDown01Icon : ArrowUp01Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-4'
							/>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side='top'
						align='end'
						sideOffset={8}
						className='w-58 rounded-[16px] border-0 bg-card p-1.5 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_16px_32px_-12px_rgba(15,23,42,0.35)]'
					>
						<DropdownMenuItem
							onSelect={() => setCompleteOpen(true)}
							className='min-h-12 cursor-pointer gap-2.5 rounded-[10px] px-3 font-display text-sm font-semibold'
						>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								strokeWidth={1.6}
								aria-hidden='true'
								className='size-5'
							/>
							Complete Shopping
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onSelect={() => setCancelOpen(true)}
							className='min-h-12 cursor-pointer gap-2.5 rounded-[10px] px-3 font-display text-sm font-semibold text-red-700 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-5'
							/>
							Cancel Shopping
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<CompleteSessionSheet
				sessionId={sessionId}
				checked={checked}
				total={total}
				open={completeOpen}
				onOpenChange={setCompleteOpen}
			/>
			<CancelSessionSheet
				sessionId={sessionId}
				open={cancelOpen}
				onOpenChange={setCancelOpen}
			/>
		</>
	)
}
