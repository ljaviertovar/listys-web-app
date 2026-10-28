import { permanentRedirect } from 'next/navigation'

/**
 * Groups are no longer a screen of their own: a saved link to the lists of a group opens the flat lists screen. It reads
 * nothing, so it answers the same for any identifier and never reveals whether a group exists.
 */
export default function LegacyGroupListsPage(): never {
	permanentRedirect('/shopping-lists')
}
