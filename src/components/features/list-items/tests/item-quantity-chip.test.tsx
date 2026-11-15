import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'

import { ItemQuantityChip } from '../item-quantity-chip'

function quantityText(quantity?: number | null, unit?: string | null) {
	return renderToStaticMarkup(createElement(ItemQuantityChip, { quantity, unit })).replace(/<[^>]+>/g, '')
}

it('uses display defaults only when quantity or unit is missing', () => {
	expect(quantityText(null, null)).toBe('1unit')
	expect(quantityText(0, 'kg')).toBe('0kg')
	expect(quantityText(2.5, 'L')).toBe('2.5L')
})
