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
					size='xl'
					variant='destructive-soft'
					onClick={() => setCancelOpen(true)}
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					Cancel Shopping
				</Button>
				<Button
					size='xl'
					onClick={() => setCompleteOpen(true)}
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
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
						<Button
							type='button'
							data-testid='session-actions-button'
							variant='floating'
							size='lg'
						>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={1.5}
								aria-hidden='true'
								className='size-4.5'
							/>
							Actions
							<HugeiconsIcon
								icon={menuOpen ? ArrowDown01Icon : ArrowUp01Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-4'
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side='top'
						align='end'
						sideOffset={8}
						variant='menu'
						className='w-58'
					>
						<DropdownMenuItem
							onSelect={() => setCompleteOpen(true)}
							size='touch'
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
							variant='destructive'
							size='touch'
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
