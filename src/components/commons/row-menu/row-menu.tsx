'use client'

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FOCUS_RING } from '@/components/app/helpers/a1-surface'
import { cn } from '@/utils'

export interface RowMenuAction {
	label: string
	icon: IconSvgElement
	onSelect: () => void
	/** `danger` paints the action red: it deletes or discards something. */
	tone?: 'default' | 'danger'
	disabled?: boolean
}

interface RowMenuProps {
	/** Accessible name of the trigger, which says what the menu belongs to ("More options for Walmart"). */
	label: string
	actions: RowMenuAction[]
	disabled?: boolean
	testId: string
	className?: string
}

/** The "⋯" menu of a card or a row: one 44px target that holds its edit and delete actions instead of two cramped icons. */
export function RowMenu({ label, actions, disabled = false, testId, className }: RowMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					aria-label={label}
					disabled={disabled}
					data-testid={testId}
					className={cn(
						'flex size-11 shrink-0 items-center justify-center rounded-[12px] text-slate-600 transition-colors hover:bg-[#E9ECF0] hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-[#E9ECF0] dark:text-muted-foreground dark:hover:bg-muted dark:data-[state=open]:bg-muted',
						FOCUS_RING,
						className,
					)}
				>
					<HugeiconsIcon
						icon={MoreHorizontalIcon}
						strokeWidth={2}
						aria-hidden='true'
						className='size-5'
					/>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-52 rounded-[16px] border-0 bg-card p-1.5 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_16px_32px_-12px_rgba(15,23,42,0.35)]'
			>
				{actions.map(action => (
					<DropdownMenuItem
						key={action.label}
						disabled={action.disabled}
						onSelect={action.onSelect}
						className={cn(
							'min-h-11 cursor-pointer gap-2.5 rounded-[10px] px-3 font-display text-sm font-semibold',
							action.tone === 'danger' && 'text-red-700 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40',
						)}
					>
						<HugeiconsIcon
							icon={action.icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-[18px]'
						/>
						{action.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
