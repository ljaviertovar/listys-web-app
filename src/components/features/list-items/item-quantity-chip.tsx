import { cn } from '@/utils'

interface ItemQuantityChipProps {
	quantity?: number | null
	unit?: string | null
	/** Fades the chip for an item that is already in the cart. */
	muted?: boolean
	testId?: string
}

/**
 * How much of an item, with the count distinguished by type rather than a badge surface: the number in mono semibold and its unit
 * in a quieter 12px, so "2 unit" reads as an amount and a word instead of one run-on token. It sits on the first line of a row,
 * before the name, so the lines under the name keep the full width of the row.
 */
export function ItemQuantityChip({ quantity, unit, muted = false, testId = 'item-quantity-chip' }: ItemQuantityChipProps) {
	return (
		<span
			data-testid={testId}
			className='inline-block shrink-0 text-left text-sm leading-5 whitespace-nowrap'
		>
			<span className={cn('font-mono font-semibold tabular-nums', muted ? 'text-muted-foreground dark:text-muted-foreground' : 'text-secondary-foreground dark:text-secondary-foreground')}>{quantity ?? 1}</span>{' '}
			<span className='font-mono text-xs font-normal text-muted-foreground dark:text-muted-foreground'>{unit || 'unit'}</span>
		</span>
	)
}
