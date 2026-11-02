import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'

interface TripReceiptsCardProps {
	/** True on the visit that follows completing the trip: the card then confirms the save and asks for the receipts. */
	justSaved?: boolean
	/** Items the trip saved, and the list they went to. */
	itemCount: number
	listName: string
}

/**
 * A completed trip with no receipt: right after completing it says the trip is saved and invites the receipts (one per store
 * visited); later it only says that none is attached and offers to add one. Attaching is confirmed on the receipt itself.
 */
export function TripReceiptsCard({ justSaved = false, itemCount, listName }: TripReceiptsCardProps) {
	return (
		<Card size='tight' data-testid='trip-receipts-card' data-state={justSaved ? 'saved' : 'no-receipt'}>
			<div className='flex flex-col gap-3'>
				<div className='flex min-w-0 flex-col gap-1'>
					<h2 className='font-display text-base leading-[1.5] font-semibold'>{justSaved ? 'Trip saved' : 'No receipts attached'}</h2>
					<p className='text-sm leading-normal text-muted-foreground'>
						{justSaved
							? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} updated in ${listName}. Add your receipts to save real prices and the total. One per store you visited, or just one store.`
							: 'Add one to save the real total and prices.'}
					</p>
				</div>
				<div className='flex flex-col gap-2 sm:flex-row'>
					<UploadTicketDialog
						label={justSaved ? 'Upload a Receipt' : 'Add Receipt'}
						className='sm:w-auto'
					/>
					{justSaved ? (
						<Button asChild variant='secondary' size='primary'>
							<Link href='/dashboard'>Keep It Separate</Link>
						</Button>
					) : null}
				</div>
				<p className='text-xs leading-normal text-muted-foreground'>A receipt can be attached to this trip within 48 hours.</p>
			</div>
		</Card>
	)
}
