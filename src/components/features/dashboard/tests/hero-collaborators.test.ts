import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HeroCollaborators } from '@/components/features/dashboard/hero-collaborators'

const people = [{ initials: 'JT' }, { initials: 'MA', display_name: 'Maria' }, { initials: 'NO' }, { initials: 'XY' }]

describe('HeroCollaborators', () => {
	it('renders nothing when the trip is not shared', () => {
		expect(renderToStaticMarkup(createElement(HeroCollaborators, { collaborators: [], caption: 'Shared with 0 people' }))).toBe('')
	})

	it('overlaps up to three initials, counts the rest and says who the trip is shared with', () => {
		const html = renderToStaticMarkup(createElement(HeroCollaborators, { collaborators: people, caption: 'Shared with 4 people' }))

		expect(html).toContain('data-testid="dashboard-hero-collaborators"')
		expect(html).toContain('JT')
		expect(html).toContain('NO')
		expect(html).not.toContain('>XY<')
		expect(html).toContain('+1')
		expect(html).toContain('title="Maria"')
		expect(html).toContain('Shared with 4 people')
	})
})
