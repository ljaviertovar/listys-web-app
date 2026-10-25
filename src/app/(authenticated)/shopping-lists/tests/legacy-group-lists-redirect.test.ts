import { describe, expect, it, vi } from 'vitest'

const permanentRedirect = vi.hoisted(() =>
	vi.fn((path: string) => {
		throw new Error(`NEXT_REDIRECT:${path}`)
	}),
)
const createClient = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ permanentRedirect, redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient }))

import LegacyGroupListsPage from '../[groupId]/lists/page'

describe('the old lists-of-a-group link', () => {
	it('sends any group to the flat lists screen without reading data', () => {
		expect(() => LegacyGroupListsPage()).toThrow('NEXT_REDIRECT:/shopping-lists')
		expect(permanentRedirect).toHaveBeenCalledWith('/shopping-lists')
		expect(createClient).not.toHaveBeenCalled()
	})

	it('takes no parameter, so a missing, foreign or valid group id all get the same answer', () => {
		expect(LegacyGroupListsPage.length).toBe(0)
	})
})
