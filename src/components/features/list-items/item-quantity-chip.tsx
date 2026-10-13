import { cn } from '@/utils'

interface ItemQuantityChipProps {
	quantity?: number | null
	unit?: string | null
	/** Fades the chip for an item that is already in the cart. */
	muted?: boolean
}

/** How much of an item: the quantity in mono and its unit on a small grey chip ("1 pcs"). */
export function ItemQuantityChip({ quantity, unit, muted = false }: ItemQuantityChipProps) {
	return (
		<span
			data-testid='item-quantity-chip'
			className={cn(
				'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[7px] bg-[#E9ECF0] px-2 text-xs leading-none font-medium text-slate-600 dark:bg-muted dark:text-muted-foreground',
				muted && 'opacity-60',
			)}
		>
			<b className='font-mono font-semibold text-foreground tabular-nums'>{quantity ?? 1}</b>
			{unit || 'unit'}
		</span>
	)
}
