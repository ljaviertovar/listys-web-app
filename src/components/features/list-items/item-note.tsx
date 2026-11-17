import { Note01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/utils'

interface ItemNoteProps {
	children: string
	/** Shows the whole note instead of cutting it after two lines. */
	wrap?: boolean
	className?: string
	testId?: string
}

/**
 * An item's note, under its name: a small note icon and the text at 12px regular, smaller than the 14px semibold name
 * so the two never read as one line. It wraps up to two lines before an ellipsis, because a note is the user's own words.
 */
export function ItemNote({ children, wrap = false, className, testId }: ItemNoteProps) {
	return (
		<span
			aria-label='Item note'
			data-testid={testId}
			className={cn('flex min-w-0 items-start gap-1 text-xs leading-4 text-muted-foreground dark:text-muted-foreground', className)}
		>
			<HugeiconsIcon
				icon={Note01Icon}
				strokeWidth={1.5}
				aria-hidden='true'
				className='mt-0.5 size-3 shrink-0'
			/>
			<span className={cn('min-w-0 break-words', !wrap && 'line-clamp-2')}>{children}</span>
		</span>
	)
}
