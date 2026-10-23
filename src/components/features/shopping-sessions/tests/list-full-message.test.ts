import { describe, expect, it } from 'vitest'

import { listFullMessage } from '../helpers/list-full-message'

describe('listFullMessage', () => {
	it('says nothing when every new item fit', () => {
		expect(listFullMessage(0)).toBeNull()
		expect(listFullMessage(Number.NaN)).toBeNull()
	})

	it('counts the items that were left out, with the right grammar', () => {
		expect(listFullMessage(1)).toBe('1 new item wasn’t saved to your list because it’s full.')
		expect(listFullMessage(3)).toBe('3 new items weren’t saved to your list because it’s full.')
	})
})
