'use client'

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import type { Ref } from 'react'
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
	triggerRef?: Ref<HTMLButtonElement>
}

/** The "⋯" menu of a card or a row: one 44px target that holds its edit and delete actions instead of two cramped icons. */
export function RowMenu({ label, actions, disabled = false, testId, className, triggerRef }: RowMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type='button'
					ref={triggerRef}
					aria-label={label}
					disabled={disabled}
					data-testid={testId}
					variant='quiet'
					size='icon-xl'
					className={className}
				>
					<HugeiconsIcon
						icon={MoreHorizontalIcon}
						strokeWidth={2}
						aria-hidden='true'
						className='size-5'
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				variant='menu'
				className='w-52'
			>
				{actions.map(action => (
					<DropdownMenuItem
						key={action.label}
						disabled={action.disabled}
						onSelect={action.onSelect}
						size='touch'
						variant={action.tone === 'danger' ? 'destructive' : 'default'}
					>
						<HugeiconsIcon
							icon={action.icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-4.5'
						/>
						{action.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
