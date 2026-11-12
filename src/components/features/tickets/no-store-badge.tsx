import { HugeiconsIcon } from '@hugeicons/react'
import { Store03Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'

/** The amber chip of a read receipt whose store nobody confirmed, the same in the receipts list and on the receipt itself. */
export function NoStoreBadge({ testId = 'ticket-no-store-badge' }: { testId?: string }) {
	return (
		<Badge variant='tag-attention' data-testid={testId}>
			<HugeiconsIcon icon={Store03Icon} strokeWidth={1.8} aria-hidden='true' />
			No store confirmed
		</Badge>
	)
}
