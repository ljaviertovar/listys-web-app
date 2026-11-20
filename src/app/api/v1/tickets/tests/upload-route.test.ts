import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createQueryBuilder, createSupabaseMock } from '@/test/helpers'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))
const background = vi.hoisted(() => ({ tasks: [] as Array<() => Promise<void>> }))
vi.mock('next/server', async importOriginal => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: (task: () => Promise<void>) => background.tasks.push(task),
}))
vi.mock('@/lib/config/ocr', () => ({ getOCRFunctionURL: () => 'https://functions.test/ocr' }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

const TRIP_ID = '0d6f4b0e-2a64-4f6a-9d3e-6c3b2c8d1a11'

/** `ownTrip` is whether the user owns TRIP_ID: the trips table answers with the row or with nothing. */
function signIn({ ownTrip = true }: { ownTrip?: boolean } = {}) {
  const { supabase } = createSupabaseMock()
  const upload = vi.fn().mockResolvedValue({ data: {}, error: null })
  supabase.storage.from = vi.fn().mockReturnValue({
    upload,
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.test' }, error: null }),
  })
  const tickets = createQueryBuilder({ data: { id: 'ticket-1' }, error: null })
  const trips = createQueryBuilder({ data: ownTrip ? { id: TRIP_ID } : null, error: null })
  supabase.from = vi.fn().mockImplementation((table: string) => (table === 'shopping_sessions' ? trips : tickets))
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return { upload, tickets, trips }
}

function upload(fields: Record<string, string> = {}) {
  const form = new FormData()
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
    'base64',
  )
  form.append('files', new File([png], 'receipt.png', { type: 'image/png' }))
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  return POST(new Request('http://localhost/api/v1/tickets', { method: 'POST', body: form }))
}

describe('POST /api/v1/tickets (upload)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    background.tasks = []
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
  })

  it('accepts photos without a store name and leaves it for OCR to fill', async () => {
    const { tickets } = signIn()

    const response = await upload()

    expect(response.status).toBe(202)
    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ store_name: null, ocr_status: 'pending' }))
  })

  it('keeps OCR running after the response and marks a rejected trigger as failed', async () => {
    const { tickets } = signIn()
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 503 }))
    expect((await upload()).status).toBe(202)
    expect(fetch).not.toHaveBeenCalled()
    expect(background.tasks).toHaveLength(1)
    await background.tasks[0]()
    expect(tickets.update).toHaveBeenCalledWith(expect.objectContaining({ ocr_status: 'failed' }))
    expect(tickets.in).toHaveBeenCalledWith('ocr_status', ['pending', 'processing'])
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

  it('remembers the trip the upload started from', async () => {
    const { tickets, trips } = signIn()

    const response = await upload({ shopping_session_id: TRIP_ID })

    expect(response.status).toBe(202)
    expect(trips.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ uploaded_from_session_id: TRIP_ID }))
  })

  it('leaves the origin empty for an upload from anywhere else', async () => {
    const { tickets, trips } = signIn()

    await upload()

    expect(trips.select).not.toHaveBeenCalled()
    expect(tickets.insert).toHaveBeenCalledWith(expect.objectContaining({ uploaded_from_session_id: null }))
  })

  it('answers 404 before storing any photo when the trip is not the caller’s', async () => {
    const { upload: storageUpload, tickets } = signIn({ ownTrip: false })

    const response = await upload({ shopping_session_id: TRIP_ID })

    expect(response.status).toBe(404)
    expect(storageUpload).not.toHaveBeenCalled()
    expect(tickets.insert).not.toHaveBeenCalled()
  })
})
