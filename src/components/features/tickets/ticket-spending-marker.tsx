import { HugeiconsIcon } from '@hugeicons/react'
import { PieChart02Icon } from '@hugeicons/core-free-icons'

/**
 * "In spending" on a receipt card: a quiet fact beside the amount it is about, not a chip. It carries no fill or ring, so the
 * chips row stays for what needs an action (a store to confirm).
 */
export function TicketSpendingMarker({ testId }: { testId: string }) {
	return (
		<span
			data-testid={testId}
			className='inline-flex shrink-0 items-center gap-1.5 text-xs leading-4 font-medium text-muted-foreground'
		>
			<HugeiconsIcon
				icon={PieChart02Icon}
				strokeWidth={1.5}
				aria-hidden='true'
				className='size-3.5'
			/>
			In spending
		</span>
	)
}
