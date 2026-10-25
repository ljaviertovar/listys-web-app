import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { historyFilterHref } from '../helpers/history-filter-href'
import { HistoryListFilter } from '../history-list-filter'

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => '/shopping-history',
	useSearchParams: () => new URLSearchParams(),
}))

const options = [
	{ id: 'a', name: 'Costco' },
	{ id: 'b', name: 'Pantry' },
]

describe('HistoryListFilter', () => {
	it('is a labelled select', () => {
		const html = renderToStaticMarkup(createElement(HistoryListFilter, { options, selectedListId: null }))

		expect(html).toContain('data-testid="history-list-filter"')
		expect(html).toContain('Show trips from')
		expect(html).toContain('role="combobox"')
	})

	it('takes its test id from the caller', () => {
		const html = renderToStaticMarkup(createElement(HistoryListFilter, { options, selectedListId: null, testId: 'trips-filter' }))

		expect(html).toContain('data-testid="trips-filter"')
	})
})

describe('historyFilterHref', () => {
	it('puts the chosen list in the URL', () => {
		expect(historyFilterHref('/shopping-history', '', 'b')).toBe('/shopping-history?list=b')
	})

	it('replaces a previous choice and keeps unrelated params', () => {
		expect(historyFilterHref('/shopping-history', 'list=a&x=1', 'b')).toBe('/shopping-history?list=b&x=1')
	})

	it('drops the param for every list so the URL is clean again', () => {
		expect(historyFilterHref('/shopping-history', 'list=a', 'all')).toBe('/shopping-history')
		expect(historyFilterHref('/shopping-history', 'list=a&x=1', 'all')).toBe('/shopping-history?x=1')
	})
})
