import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { OCR_TIMEOUT_MESSAGE } from '@/lib/config/ocr-policy'
import { TicketUnreadableState } from '../ticket-unreadable-state'

vi.mock('../../upload/upload-ticket-dialog', () => ({ UploadTicketDialog: () => null }))
vi.mock('../ticket-actions', () => ({ TicketActions: () => null }))

describe('receipt failure explanation', () => {
  it('shows the safe service explanation for a timeout', () => {
    const html = renderToStaticMarkup(createElement(TicketUnreadableState, { ticketId: 'receipt-1', kind: 'failed', ocrError: OCR_TIMEOUT_MESSAGE }))
    expect(html).toContain(OCR_TIMEOUT_MESSAGE)
    expect(html).not.toContain('Nothing was saved.')
  })
})
