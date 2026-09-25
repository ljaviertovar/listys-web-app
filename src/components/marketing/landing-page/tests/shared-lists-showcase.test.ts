import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SharedListsShowcase } from '../shared-lists-showcase'

function render() {
	return renderToStaticMarkup(createElement(SharedListsShowcase))
}

describe('SharedListsShowcase', () => {
	it('leads with the photo banner, which carries the section headline', () => {
		const html = render()

		expect(html).toContain('data-testid="shared-lists-banner"')
		expect(html).toContain('alt="Two shoppers, one at a kitchen counter and one in a grocery aisle')
		expect(html).toContain('shared-lists.webp')
		// The headline moved onto the photo, so it must exist exactly once.
		expect(html.match(/<h2/g)).toHaveLength(1)
		expect(html).toContain('Two of you, one list, in real time.')
	})

	it('serves a shorter intro on narrow screens and the full copy from 640px up', () => {
		const html = render()

		expect(html).toContain('the check lands for her the moment he taps it')
		expect(html).toContain('it is ticked for her')
	})

	it('keeps the proof under the banner: both devices, the sync link, and toast-style activity', () => {
		const html = render()

		expect(html).toContain('Noah · in the aisle')
		expect(html).toContain('Maya · at home')
		expect(html).toContain('Synced')
		expect(html).toContain('data-testid="activity-toast-stack"')
		expect(html.match(/data-testid="activity-toast-/g)).toHaveLength(3)
		expect(html).toContain('checked off almond milk')
		expect(html).toContain('Maya, Noah and Ava share this list')
	})
})
