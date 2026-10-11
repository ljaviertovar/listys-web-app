import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PageContainer from '@/components/app/app-page/page-container'

describe('PageContainer', () => {
	it('reserves the mobile tab bar height, safe area and a final content gap', () => {
		const html = renderToStaticMarkup(createElement(PageContainer, null, 'Page content'))

		expect(html).toContain('pb-[calc(4.5rem+max(1.125rem,env(safe-area-inset-bottom)))]')
		expect(html).toContain('lg:pb-20')
	})
})
