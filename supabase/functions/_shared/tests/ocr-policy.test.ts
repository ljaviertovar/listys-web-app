import { describe, expect, it } from 'vitest'
import { safeOcrError, OCR_TIMEOUT_MESSAGE, OCR_UNAVAILABLE_MESSAGE, OCR_FAILED_MESSAGE } from '../ocr-policy'

describe('receipt error disclosure', () => {
  it.each([OCR_TIMEOUT_MESSAGE, OCR_UNAVAILABLE_MESSAGE, OCR_FAILED_MESSAGE])('preserves an approved actionable error', message => {
    expect(safeOcrError(message)).toBe(message)
  })

  it('replaces historical provider and database details with safe copy', () => {
    expect(safeOcrError('SQL/provider failure containing private configuration')).toBe(OCR_FAILED_MESSAGE)
    expect(safeOcrError(null)).toBeNull()
  })
})
