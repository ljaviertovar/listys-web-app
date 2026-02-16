import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('OCR config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('defaults to gemini and falls back for unknown providers', async () => {
    vi.stubEnv('PROCESS_TICKET_OCR_PROVIDER', '')
    const mod1 = await import('../ocr')
    expect(mod1.OCR_PROVIDER).toBe('gemini')

    vi.resetModules()
    vi.stubEnv('PROCESS_TICKET_OCR_PROVIDER', 'anthropic')
    const mod2 = await import('../ocr')
    expect(mod2.OCR_PROVIDER).toBe('gemini')
  })

  it('selects openai when configured', async () => {
    vi.stubEnv('PROCESS_TICKET_OCR_PROVIDER', 'openai')
    const mod = await import('../ocr')
    expect(mod.OCR_PROVIDER).toBe('openai')
    expect(mod.getOCRFunctionName()).toBe('process-ticket-ocr-openai')
  })

  it('builds correct function URL', async () => {
    vi.stubEnv('PROCESS_TICKET_OCR_PROVIDER', 'gemini')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    const { getOCRFunctionURL } = await import('../ocr')
    expect(getOCRFunctionURL()).toBe('https://example.supabase.co/functions/v1/process-ticket-ocr-gemini')
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('PROCESS_TICKET_OCR_PROVIDER', 'gemini')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    const { getOCRFunctionURL } = await import('../ocr')
    expect(() => getOCRFunctionURL()).toThrow('NEXT_PUBLIC_SUPABASE_URL not configured')
  })
})
