import { cn } from '@/utils'

interface ItemQuantityChipProps {
	quantity?: number | null
	unit?: string | null
	/** Fades the chip for an item that is already in the cart. */
	muted?: boolean
	testId?: string
}

/** How much of an item, with the count distinguished by type rather than a badge surface. */
export function ItemQuantityChip({ quantity, unit, muted = false, testId = 'item-quantity-chip' }: ItemQuantityChipProps) {
	return (
		<span
			data-testid={testId}
			className={cn('inline-flex items-center text-left font-mono text-sm leading-5 font-semibold tabular-nums', muted ? 'text-muted-foreground dark:text-muted-foreground' : 'text-secondary-foreground dark:text-secondary-foreground')}
		>
			{quantity ?? 1}{unit || 'unit'}
		</span>
	)
}
