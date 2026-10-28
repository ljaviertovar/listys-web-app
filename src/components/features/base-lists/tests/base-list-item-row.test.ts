import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BaseListItemWithStoreSummary } from '@/types'

vi.mock('@/components/commons', () => ({
	RowMenu: ({ actions, disabled }: { actions: Array<{ label: string }>; disabled?: boolean }) => createElement('div', { 'data-testid': 'mock-row-menu', 'data-disabled': String(Boolean(disabled)) }, actions.map(action => action.label).join('|')),
	SheetDialog: () => null,
}))
vi.mock('@/components/features/list-items', () => ({
  AveragePrice: () => null,
  ItemEditForm: () => null,
  ItemQuantityChip: () => null,
}))
vi.mock('@/components/features/stores', () => ({ StorePickerDialog: () => null }))
vi.mock('@/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils')>()
  return { ...actual, formatItemName: (name: string) => name, isUsablePrice: (price: number | null) => price !== null }
})
vi.mock('../items/hooks/use-base-list-item-actions', () => ({
  useBaseListItemActions: () => ({
    save: vi.fn(),
    remove: vi.fn(),
    setUsualStore: vi.fn(),
  }),
}))

import { BaseListItemRow } from '../items/base-list-item-row'

const item = {
  id: 'item-1',
  base_list_id: 'list-1',
  name: 'Milk',
  quantity: 1,
  unit: 'bottle',
  notes: null,
  average_price: null,
} as BaseListItemWithStoreSummary

function render(row: Partial<BaseListItemWithStoreSummary>, isOwner = true) {
  return renderToStaticMarkup(createElement(BaseListItemRow, { item: { ...item, ...row }, isOwner }))
}

describe('BaseListItemRow store labels', () => {
  it('shows the usual-store chip when the list has a tag', () => {
    const html = render({ usual_store: { id: 'store-1', name: 'No Frills', source: 'auto' } })
    expect(html).toContain('No Frills')
    expect(html).toContain('base-list-item-item-1-usual-store')
    expect(html).toContain('Usual store: No Frills (automatic)')
  })

  it('hides store labels when there is no store data', () => {
    const html = render({ usual_store: null, other_stores: [] })
    expect(html).not.toContain('usual-store')
    expect(html).not.toContain('Also at')
  })

  it('shows the other-store summary by itself', () => {
    const html = render({
      usual_store: null,
      other_stores: [
        { id: 'store-1', name: 'Metro', purchase_count: 4 },
        { id: 'store-2', name: 'Costco', purchase_count: 2 },
      ],
    })
    expect(html).toContain('Also at Metro, Costco')
    expect(html).toContain('Other stores: Metro, Costco')
    expect(html).not.toContain('usual-store')
  })

  it('hides owner-only store actions from collaborators', () => {
    const html = render({ usual_store: { id: 'store-1', name: 'No Frills', source: 'manual' } }, false)
    expect(html).not.toContain('Change Usual Store')
    expect(html).not.toContain('Use Automatic Store')
  })

	it('offers set or change based on the tag and automatic reset only for manual tags', () => {
		const untagged = render({ usual_store: null })
		const automatic = render({ usual_store: { id: 'store-1', name: 'No Frills', source: 'auto' } })
		const manual = render({ usual_store: { id: 'store-1', name: 'No Frills', source: 'manual' } })

		expect(untagged).toContain('Set Usual Store…')
		expect(untagged).not.toContain('Use Automatic Store')
		expect(automatic).toContain('Change Usual Store…')
		expect(automatic).not.toContain('Use Automatic Store')
		expect(manual).toContain('Change Usual Store…')
		expect(manual).toContain('Use Automatic Store')
	})

	it('disables the menu while the list is locked', () => {
		const html = renderToStaticMarkup(createElement(BaseListItemRow, { item, isLocked: true }))
		expect(html).toContain('data-disabled="true"')
	})

	it('offers receipt prices only to the owner when a store price exists', () => {
		const storePrice = {
			store: { id: 'store-1', name: 'No Frills' }, last_price: 5.49,
			last_quantity: 1, last_unit: null, last_price_at: '2026-03-04T00:00:00Z',
		}
		expect(render({ store_prices: [storePrice] })).toContain('Prices by Store')
		expect(render({ store_prices: [] })).not.toContain('Prices by Store')
		expect(render({ store_prices: [storePrice] }, false)).not.toContain('Prices by Store')
	})
})
