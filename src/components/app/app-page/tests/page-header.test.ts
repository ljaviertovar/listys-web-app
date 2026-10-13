import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PageHeader from '@/components/app/app-page/page-header'

describe('PageHeader', () => {
	it('keeps the white band with a bottom border by default', () => {
		const html = renderToStaticMarkup(createElement(PageHeader, { title: 'Lists', desc: 'Your lists' }))

		expect(html).toContain('border-b bg-card')
		expect(html).not.toContain('data-variant="screen"')
	})

	it('draws the A1 screen header: back link above a 30px title, on the page ground', () => {
		const html = renderToStaticMarkup(
			createElement(
				PageHeader,
				{ title: 'Receipts', desc: 'Upload and manage your shopping receipts', variant: 'screen', back: { href: '/dashboard', label: 'Back to Dashboard' } },
				createElement('button', null, 'Upload Receipt'),
			),
		)

		expect(html).toContain('data-testid="page-header"')
		expect(html).toContain('data-variant="screen"')
		expect(html).toContain('href="/dashboard"')
		expect(html).toContain('Back to Dashboard')
		expect(html).toMatch(/<h1[^>]*text-\[30px\][^>]*>Receipts<\/h1>/)
		expect(html).toContain('Upload Receipt')
		expect(html).not.toContain('border-b bg-card')
	})

	it('can carry markup in the description, such as a date set in mono', () => {
		const html = renderToStaticMarkup(
			createElement(PageHeader, {
				title: 'Grocery',
				variant: 'screen',
				desc: createElement('span', { className: 'font-mono' }, '16 Feb 2026'),
			}),
		)

		expect(html).toContain('<span class="font-mono">16 Feb 2026</span>')
	})
})
