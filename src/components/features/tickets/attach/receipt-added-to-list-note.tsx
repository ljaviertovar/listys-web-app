import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Why a receipt that went into a list is not offered a trip: a receipt takes part in one of the two, so the person is told
 * instead of finding the "recent trip" card missing.
 */
export function ReceiptAddedToListNote() {
	return (
		<Alert
			role='note'
			data-testid='receipt-added-to-list-note'
		><AlertDescription>
			The items of this receipt were added to a list, so it can’t also be attached to a trip.
		</AlertDescription></Alert>
	)
}
