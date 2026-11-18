import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api/endpoints', () => ({ setUpDefaultPantry: vi.fn() }))

import { setUpDefaultPantry } from '@/lib/api/endpoints'
import { PANTRY_SETUP_ERROR, requestPantrySetup } from '../helpers/request-pantry-setup'

const mockedSetUp = vi.mocked(setUpDefaultPantry)

describe('requestPantrySetup', () => {
	beforeEach(() => vi.clearAllMocks())

	it.each([
		['created', 'Pantry created'],
		['adopted', 'Pantry is now your default list'],
		['existing', 'You already have a default list'],
	])('tells the user what happened when the outcome is %s', async (outcome, message) => {
		mockedSetUp.mockResolvedValue({ data: { id: 'list-1', outcome } })

		await expect(requestPantrySetup()).resolves.toEqual({ ok: true, message })
	})

	it('answers with the fixed error when the server reports one, whatever its text', async () => {
		mockedSetUp.mockResolvedValue({ error: 'permission denied for table groups "secret"' })

		await expect(requestPantrySetup()).resolves.toEqual({ ok: false, message: PANTRY_SETUP_ERROR })
	})

	it('answers with the fixed error when the response has no known outcome', async () => {
		mockedSetUp.mockResolvedValue({ data: { id: 'list-1', outcome: 'something-new' } })

		await expect(requestPantrySetup()).resolves.toEqual({ ok: false, message: PANTRY_SETUP_ERROR })
	})

	it('answers with the fixed error when the request itself rejects', async () => {
		mockedSetUp.mockRejectedValue(new Error('network down with details'))

		await expect(requestPantrySetup()).resolves.toEqual({ ok: false, message: PANTRY_SETUP_ERROR })
	})
})
