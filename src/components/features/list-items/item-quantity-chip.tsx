import { Badge } from '@/components/ui/badge'

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
		<Badge
			data-testid={testId}
			variant={muted ? 'outline' : 'secondary'}
		>
			<b className='font-mono font-semibold text-foreground tabular-nums'>{quantity ?? 1}</b>
			{unit || 'unit'}
		</Badge>
	)
}
