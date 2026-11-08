import { beforeEach, describe, expect, it, vi } from 'vitest'

const permanentRedirect = vi.hoisted(() =>
	vi.fn((path: string) => {
		throw new Error(`NEXT_REDIRECT:${path}`)
	}),
)
const createClient = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ permanentRedirect, redirect: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient }))

import LegacyGroupHistoryPage from '../[groupId]/page'
import LegacyHistoryPage from '../page'

beforeEach(() => vi.clearAllMocks())

describe('the old history-of-a-group link', () => {
	it('sends any group to the trips without reading data', () => {
		expect(() => LegacyGroupHistoryPage()).toThrow('NEXT_REDIRECT:/trips')
		expect(permanentRedirect).toHaveBeenCalledWith('/trips')
		expect(createClient).not.toHaveBeenCalled()
	})

	it('takes no parameter, so a missing, foreign or valid group id all get the same answer', () => {
		expect(LegacyGroupHistoryPage.length).toBe(0)
	})
})

describe('the old history link', () => {
	const open = (searchParams: Record<string, string | string[]>) => LegacyHistoryPage({ searchParams: Promise.resolve(searchParams) })

	it('keeps the list the history was narrowed to', async () => {
		await expect(open({ list: 'list-1' })).rejects.toThrow('NEXT_REDIRECT:/trips?list=list-1')
	})

	it('takes the first list when several are given', async () => {
		await expect(open({ list: ['a', 'b'] })).rejects.toThrow('NEXT_REDIRECT:/trips?list=a')
	})

	it('opens all trips when no list is given, without reading data', async () => {
		await expect(open({})).rejects.toThrow('NEXT_REDIRECT:/trips')
		expect(permanentRedirect).toHaveBeenCalledWith('/trips')
		expect(createClient).not.toHaveBeenCalled()
	})
})
