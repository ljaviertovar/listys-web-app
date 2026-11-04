import { Note01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/utils'

interface ItemNoteProps {
	children: string
	/** Lets the note wrap (a trip row) instead of cutting it with an ellipsis (a list row). */
	wrap?: boolean
	className?: string
}

/**
 * An item's note, under its name: a small note icon and the text at 12px regular, smaller and lighter than the 14px
 * semibold name so the two never read as one line.
 */
export function ItemNote({ children, wrap = false, className }: ItemNoteProps) {
	return (
		<span
			aria-label='Item note'
			className={cn('flex min-w-0 items-start gap-1 text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground', className)}
		>
			<HugeiconsIcon
				icon={Note01Icon}
				strokeWidth={1.5}
				aria-hidden='true'
				className='mt-px size-3.5 shrink-0'
			/>
			<span className={cn('min-w-0', wrap ? 'break-words' : 'truncate')}>{children}</span>
		</span>
	)
}
