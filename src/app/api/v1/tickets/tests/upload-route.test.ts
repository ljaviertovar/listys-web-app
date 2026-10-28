import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createQueryBuilder, createSupabaseMock } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))
vi.mock('@/lib/config/ocr', () => ({ getOCRFunctionURL: () => 'https://functions.test/ocr' }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn() {
  const { supabase } = createSupabaseMock()
  const upload = vi.fn().mockResolvedValue({ data: {}, error: null })
  supabase.storage.from = vi.fn().mockReturnValue({
    upload,
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.test' }, error: null }),
  })
  const tickets = createQueryBuilder({ data: { id: 'ticket-1' }, error: null })
  supabase.from = vi.fn().mockReturnValue(tickets)
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return { upload, tickets }
}

function upload(fields: Record<string, string> = {}) {
  const form = new FormData()
  form.append('files', new File(['photo'], 'receipt.jpg', { type: 'image/jpeg' }))
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  return POST(new Request('http://localhost/api/v1/tickets', { method: 'POST', body: form }))
}

describe('POST /api/v1/tickets (upload)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
  })

  it('accepts photos without a store name and leaves it for OCR to fill', async () => {
    const { tickets } = signIn()

    const response = await upload()

    expect(response.status).toBe(202)
    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ store_name: null, ocr_status: 'pending' }))
  })

  it('keeps a store name sent by an API client, cleaned up', async () => {
    const { tickets } = signIn()

    const response = await upload({ store_name: '  Corner   Market ' })

    expect(response.status).toBe(202)
    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ store_name: 'Corner Market' }))
  })

  it('treats a blank store name as absent', async () => {
    const { tickets } = signIn()

    await upload({ store_name: '   ' })

    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ store_name: null }))
  })

  it('rejects a store name over 100 characters with 422 before storing any photo', async () => {
    const { upload: storageUpload, tickets } = signIn()

    const response = await upload({ store_name: 'x'.repeat(101) })

    expect(response.status).toBe(422)
    expect(storageUpload).not.toHaveBeenCalled()
    expect(tickets.insert).not.toHaveBeenCalled()
  })
})
