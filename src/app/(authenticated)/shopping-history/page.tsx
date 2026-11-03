import { permanentRedirect } from 'next/navigation'

import { tripsHref } from '@/components/features/shopping-sessions/helpers/trips-href'

/**
 * The section is called Trips and lives at /trips: a saved link to the old history opens it, keeping the list it was
 * narrowed to. It reads no data, so an unknown list value gets the same answer and is judged by the trips page.
 */
export default async function LegacyHistoryPage({ searchParams }: { searchParams: Promise<{ list?: string | string[] }> }): Promise<never> {
	const { list } = await searchParams
	permanentRedirect(tripsHref(Array.isArray(list) ? list[0] : list))
}
