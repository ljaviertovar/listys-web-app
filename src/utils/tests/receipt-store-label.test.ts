import { describe, expect, it } from 'vitest'

import { getReceiptStoreLabel } from '../receipt-store-label'

describe('getReceiptStoreLabel', () => {
  it('uses the confirmed store over the raw name', () => {
    expect(getReceiptStoreLabel({ store: { name: 'No Frills' }, store_name: 'NOFRILLS #3127' })).toBe('No Frills')
  })

  it('falls back to the raw name read from the receipt', () => {
    expect(getReceiptStoreLabel({ store: null, store_name: '  NOFRILLS #3127 ' })).toBe('NOFRILLS #3127')
  })

  it.each([
    { store: null, store_name: null },
    { store: null, store_name: '   ' },
    {},
  ])('says the store was not recognized when there is neither (%o)', receipt => {
    expect(getReceiptStoreLabel(receipt)).toBe('Store not recognized')
  })
})
