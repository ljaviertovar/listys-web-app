/**
 * Why a receipt that went into a list is not offered a trip: a receipt takes part in one of the two, so the person is told
 * instead of finding the "recent trip" card missing.
 */
export function ReceiptAddedToListNote() {
	return (
		<p
			role='note'
			data-testid='receipt-added-to-list-note'
			className='rounded-3xl bg-card p-3 text-sm leading-normal text-muted-foreground shadow-card md:p-4'
		>
			The items of this receipt were added to a list, so it can’t also be attached to a trip.
		</p>
	)
}
