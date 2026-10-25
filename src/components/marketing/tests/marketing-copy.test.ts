import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FaqSection } from '../landing-page/faq/faq-section'
import { FeaturesSection } from '../landing-page/features/features-section'
import { GetStartedSection } from '../landing-page/get-started/get-started-section'
import { FEATURE_CARDS, PROCESS_STEPS } from '@/data/constants/landing'

describe('marketing copy', () => {
	it('describes receipt review and item selection before adding to a reusable list', () => {
		const html = [FaqSection, FeaturesSection, GetStartedSection]
			.map(Component => renderToStaticMarkup(createElement(Component)))
			.join(' ')
			.toLowerCase()

		expect(html).toContain('review the items from a receipt and choose what to add')
		expect(html).toContain('compare the extracted items with your receipt')
		expect(html).toContain('review the extracted items')
		expect(html).toContain('share a base list using its invite link')
		expect(html).not.toContain('invite them to a group')
		expect(html).not.toContain('Every line stays editable')
		expect(html).not.toContain('become a base list you keep')
	})

	it('does not promise to organize lists into groups, which the app no longer has', () => {
		const text = [FaqSection, FeaturesSection, GetStartedSection]
			.map(Component => renderToStaticMarkup(createElement(Component)).replace(/<[^>]*>/g, ' '))
			.join(' ')

		expect(text).not.toMatch(/\bgroups?\b/i)
		expect(text).toContain('Keep a list for each need')
		expect(JSON.stringify({ PROCESS_STEPS, FEATURE_CARDS })).not.toMatch(/\bgroups?\b/i)
	})

	it('removes unsupported speed, precision, and automatic-learning claims from shared copy', () => {
		const sharedCopy = JSON.stringify({ PROCESS_STEPS, FEATURE_CARDS })

		expect(sharedCopy).toContain('choose what to add')
		expect(sharedCopy).not.toContain('99%')
		expect(sharedCopy).not.toContain('in seconds')
		expect(sharedCopy).not.toContain('magically')
		expect(sharedCopy).not.toContain('automatically sorts')
		expect(sharedCopy).not.toContain('editable items')
	})
})
