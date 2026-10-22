import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DetailsList } from '@/components/commons'

describe('DetailsList', () => {
	it('uses definition terms and values and keeps long values available', () => {
		const longValue = 'A very long display name and a long email local part that should wrap on a narrow phone'
		const html = renderToStaticMarkup(
			createElement(DetailsList, {
				testId: 'profile-details',
				items: [
					{ label: 'Display name', value: longValue },
					{ label: 'Email', value: 'a.long.synthetic.email.address.for.mobile.reflow@example.test' },
				],
			}),
		)

		expect(html).toContain('data-testid="profile-details"')
		expect(html).toContain('<dl')
		expect(html).toContain('<dt')
		expect(html).toContain('<dd')
		expect(html).toContain(longValue)
		expect(html).toContain('a.long.synthetic.email.address.for.mobile.reflow@example.test')
		expect(html).toContain('break-words')
	})
})
