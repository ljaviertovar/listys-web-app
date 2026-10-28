import { permanentRedirect } from 'next/navigation'

/**
 * The history is one screen now: a saved link to the history of a group opens it. It reads nothing, so it answers the same
 * for any identifier and never reveals whether a group exists.
 */
export default function LegacyGroupHistoryPage(): never {
	permanentRedirect('/shopping-history')
}
