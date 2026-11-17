import { describe, expect, it } from 'vitest'

import { getReceiptName } from '../receipt-store-label'

describe('getReceiptName', () => {
  it('names the receipt after the confirmed store, over the raw name', () => {
    expect(getReceiptName({ store: { name: 'No Frills' }, store_name: 'NOFRILLS #3127' })).toBe('No Frills Receipt')
  })

  it('falls back to the raw name read from the receipt, without its branch number or capitals', () => {
    expect(getReceiptName({ store: null, store_name: '  WALMART #1042 ' })).toBe('Walmart Receipt')
  })

  it.each([
    { store: null, store_name: null },
    { store: null, store_name: '   ' },
    { store: { name: '  ' }, store_name: null },
    {},
  ])('is "Unnamed Receipt" when there is no store name (%o)', receipt => {
    expect(getReceiptName(receipt)).toBe('Unnamed Receipt')
  })
})
