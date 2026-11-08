import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CategorySection } from '../category-section'

function ControlledCategorySection({ open }: { open: boolean }) {
	return (
		<CategorySection category='Dairy' count='1/1' open={open} onOpenChange={() => undefined} testId='category-dairy'>
			<p data-testid='category-content'>Milk</p>
		</CategorySection>
	)
}

function render(open: boolean) {
	return renderToStaticMarkup(createElement(ControlledCategorySection, { open }))
}

describe('CategorySection controlled open state', () => {
	it('reflects controlled open and closed values', () => {
		const open = render(true)
		const closed = render(false)

		expect(open).toContain('aria-expanded="true"')
		expect(open).toContain('data-testid="category-content"')
		expect(closed).toContain('aria-expanded="false"')
		expect(closed).not.toContain('data-testid="category-content"')
	})
})
