/**
 * Whether the "Set up Pantry" action is offered. Only an account that is known to have no default list gets it: when the
 * query that looks for the default list failed we cannot tell, and offering it would invite a pointless request.
 */
export function shouldOfferPantrySetup({ queryFailed, defaultListId }: { queryFailed: boolean; defaultListId: string | null }) {
	return !queryFailed && defaultListId === null
}
