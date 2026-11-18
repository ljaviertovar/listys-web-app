import { setUpDefaultPantry } from '@/lib/api/endpoints'

export const PANTRY_SETUP_ERROR = 'We couldn’t set up your Pantry. Try again.'

export type PantrySetupResult = { ok: true; message: string } | { ok: false; message: string }

const SUCCESS_MESSAGES: Record<string, string> = {
	created: 'Pantry created',
	adopted: 'Pantry is now your default list',
	existing: 'You already have a default list',
}

/**
 * Asks the server to give the account a default list and says what to tell the user. The error text is fixed on purpose:
 * whatever went wrong (network, server, database) the person only needs to know it did not work and can try again.
 */
export async function requestPantrySetup(): Promise<PantrySetupResult> {
	try {
		const { data, error } = await setUpDefaultPantry()
		const message = typeof data?.outcome === 'string' ? SUCCESS_MESSAGES[data.outcome] : undefined

		if (error || !message) return { ok: false, message: PANTRY_SETUP_ERROR }
		return { ok: true, message }
	} catch {
		return { ok: false, message: PANTRY_SETUP_ERROR }
	}
}
