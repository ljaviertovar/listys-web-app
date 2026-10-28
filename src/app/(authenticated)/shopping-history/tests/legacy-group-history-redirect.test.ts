import { describe, expect, it, vi } from 'vitest'

const permanentRedirect = vi.hoisted(() =>
	vi.fn((path: string) => {
		throw new Error(`NEXT_REDIRECT:${path}`)
	}),
)
const createClient = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ permanentRedirect, redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient }))

import LegacyGroupHistoryPage from '../[groupId]/page'

describe('the old history-of-a-group link', () => {
	it('sends any group to the shopping history without reading data', () => {
		expect(() => LegacyGroupHistoryPage()).toThrow('NEXT_REDIRECT:/shopping-history')
		expect(permanentRedirect).toHaveBeenCalledWith('/shopping-history')
		expect(createClient).not.toHaveBeenCalled()
	})

	it('takes no parameter, so a missing, foreign or valid group id all get the same answer', () => {
		expect(LegacyGroupHistoryPage.length).toBe(0)
	})
})
