import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { SessionBar, isSessionScreen } from '@/components/app/active-session'

// The container reads the App Router and Supabase; these tests cover the bar and its rule.
vi.mock('next/navigation', () => ({ usePathname: () => '/shopping-lists' }))

describe('SessionBar', () => {
	const render = (progress: { checked: number; total: number } | null = { checked: 3, total: 19 }) =>
		renderToStaticMarkup(createElement(SessionBar, { id: 's1', name: 'Items for Dinner', progress }))

	it('is one link to the running session with its name, its count and a Continue look-alike', () => {
		const html = render()

		expect(html).toContain('data-testid="active-session-bar"')
		expect(html).toContain('href="/shopping/s1"')
		expect(html).toContain('Items for Dinner')
		expect(html).toContain('3 of 19 · 16%')
		expect(html).toContain('Continue<span class="sr-only"> Shopping</span>')
	})

	it('is a 48px dark bar that only exists on phones and floats above the tab bar', () => {
		const html = render()

		expect(html).toContain('lg:hidden')
		expect(html).toContain('fixed inset-x-0 z-30')
		expect(html).toContain('bottom-[calc(3rem+max(1.125rem,env(safe-area-inset-bottom)))]')
		expect(html).toContain('h-12')
		expect(html).toContain('rounded-[16px] bg-slate-900')
		expect(html).toContain('size-7')
	})

	it('only says the trip is in progress until its count has loaded', () => {
		const html = render(null)

		expect(html).toContain('In progress')
		expect(html).not.toContain(' of ')
	})

	it('draws the ring from the progress', () => {
		expect(render({ checked: 0, total: 4 })).toContain('stroke-dasharray="0 94.24')
		expect(render({ checked: 4, total: 4 })).toMatch(/stroke-dasharray="94\.24/)
	})
})

describe('isSessionScreen', () => {
	it('is true only on the screen of that session', () => {
		expect(isSessionScreen('/shopping/s1', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s1/anything', 's1')).toBe(true)
		expect(isSessionScreen('/shopping/s2', 's1')).toBe(false)
		expect(isSessionScreen('/shopping-lists', 's1')).toBe(false)
		expect(isSessionScreen('/shopping/s10', 's1')).toBe(false)
	})
})
