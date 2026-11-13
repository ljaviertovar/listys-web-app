import { cn } from '@/utils'

interface ItemQuantityChipProps {
	quantity?: number | null
	unit?: string | null
	/** Fades the chip for an item that is already in the cart. */
	muted?: boolean
	testId?: string
}

/** How much of an item: the quantity in mono and its unit on a small grey chip ("1 pcs"). */
export function ItemQuantityChip({ quantity, unit, muted = false, testId = 'item-quantity-chip' }: ItemQuantityChipProps) {
	return (
		<span
			data-testid={testId}
			className={cn(
				'inline-flex h-5.5 shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 text-xs leading-none font-medium text-body dark:bg-muted dark:text-muted-foreground',
				muted && 'opacity-60',
			)}
		>
			<b className='font-mono font-semibold text-foreground tabular-nums'>{quantity ?? 1}</b>
			{unit || 'unit'}
		</span>
	)
}
