import { describe, expect, it } from 'vitest'

import { STARTED_SESSION_PARAM, startedSessionHref } from '@/components/features/shopping-sessions'

describe('startedSessionHref', () => {
	it('sends a new session to its page with the one-visit flag the page reads', () => {
		expect(startedSessionHref('abc')).toBe(`/shopping/abc?${STARTED_SESSION_PARAM}=1`)
	})
})
