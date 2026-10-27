import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createQueryBuilder, createSupabaseMock, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { MAX_STORES_PER_USER } from '@/lib/config/limits'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET, POST } from '../route'
import { PATCH } from '../[storeId]/route'
import { POST as MERGE } from '../[storeId]/merge/route'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const ROW = { id: TEST_UUID, name: 'No Frills', created_at: '2026-10-25T00:00:00Z', updated_at: '2026-10-25T00:00:00Z' }

function signIn(opts?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(opts)
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

function signedOut() {
  mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
}

const json = (method: string, url: string, body?: unknown) =>
  new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })

const params = (storeId: string) => ({ params: Promise.resolve({ storeId }) })

describe('GET /api/v1/stores', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the stores with meta', async () => {
    signIn({ tables: { stores: { data: [{ ...ROW, receipts: [{ count: 2 }] }], error: null } } })

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      data: [{ id: TEST_UUID, name: 'No Frills', receipt_count: 2, created_at: ROW.created_at, updated_at: ROW.updated_at }],
      meta: { count: 1, limit: MAX_STORES_PER_USER },
    })
  })

  it('answers 401 when signed out', async () => {
    signedOut()
    expect((await GET()).status).toBe(401)
  })
})

describe('POST /api/v1/stores', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a store: 201 with a Location header', async () => {
    signIn({ rpcResults: { create_store: { data: ROW, error: null } } })

    const response = await POST(json('POST', 'http://localhost/api/v1/stores', { name: 'No Frills' }))

    expect(response.status).toBe(201)
    expect(response.headers.get('Location')).toBe(`/api/v1/stores/${TEST_UUID}`)
    expect((await response.json()).data).toMatchObject({ id: TEST_UUID, name: 'No Frills', receipt_count: 0 })
  })

  it('answers 422 for a blank name and 400 for malformed JSON', async () => {
    const supabase = signIn()

    expect((await POST(json('POST', 'http://localhost/api/v1/stores', { name: '  ' }))).status).toBe(422)
    expect((await POST(json('POST', 'http://localhost/api/v1/stores', '{nope'))).status).toBe(400)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 409 CONFLICT with the store that already has the name', async () => {
    signIn({ rpcResults: { create_store: { data: null, error: { code: '23505', message: 'Store already exists', details: TEST_UUID_2 } } } })

    const response = await POST(json('POST', 'http://localhost/api/v1/stores', { name: 'NOFRILLS' }))

    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatchObject({ code: 'CONFLICT', details: { store_id: TEST_UUID_2 } })
  })

  it('answers 409 LIMIT_EXCEEDED at the store limit', async () => {
    signIn({ rpcResults: { create_store: { data: null, error: { code: 'P0001', message: 'Store limit reached (50)' } } } })

    const response = await POST(json('POST', 'http://localhost/api/v1/stores', { name: 'One more' }))

    expect(response.status).toBe(409)
    expect((await response.json()).error.code).toBe('LIMIT_EXCEEDED')
  })

  it('answers 401 when signed out', async () => {
    signedOut()
    expect((await POST(json('POST', 'http://localhost/api/v1/stores', { name: 'Metro' }))).status).toBe(401)
  })
})

describe('PATCH /api/v1/stores/:storeId', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renames the store', async () => {
    const supabase = signIn({ rpcResults: { rename_store: { data: { ...ROW, name: 'Metro' }, error: null } } })
    supabase.from = vi.fn().mockReturnValue(createQueryBuilder({ count: 1, error: null }))

    const response = await PATCH(json('PATCH', `http://localhost/api/v1/stores/${TEST_UUID}`, { name: 'Metro' }), params(TEST_UUID))

    expect(response.status).toBe(200)
    expect((await response.json()).data).toMatchObject({ name: 'Metro', receipt_count: 1 })
  })

  it('answers 422 for an invalid id', async () => {
    signIn()
    const response = await PATCH(json('PATCH', 'http://localhost/api/v1/stores/nope', { name: 'Metro' }), params('nope'))
    expect(response.status).toBe(422)
  })

  it('answers 404 for a store that is missing or someone else’s', async () => {
    signIn({ rpcResults: { rename_store: { data: null, error: { code: 'P0002', message: 'Store not found' } } } })
    const response = await PATCH(json('PATCH', `http://localhost/api/v1/stores/${TEST_UUID}`, { name: 'Metro' }), params(TEST_UUID))
    expect(response.status).toBe(404)
  })

  it('answers 409 when another store already uses the new name', async () => {
    signIn({ rpcResults: { rename_store: { data: null, error: { code: '23505', message: 'Store already exists', details: TEST_UUID_2 } } } })
    const response = await PATCH(json('PATCH', `http://localhost/api/v1/stores/${TEST_UUID}`, { name: 'No Frills' }), params(TEST_UUID))
    expect(response.status).toBe(409)
    expect((await response.json()).error.details).toEqual({ store_id: TEST_UUID_2 })
  })
})

describe('POST /api/v1/stores/:storeId/merge', () => {
  beforeEach(() => vi.clearAllMocks())

  it('merges the source store into this one', async () => {
    const supabase = signIn({ rpcResults: { merge_stores: { data: ROW, error: null } } })
    supabase.from = vi.fn().mockReturnValue(createQueryBuilder({ count: 7, error: null }))

    const response = await MERGE(json('POST', `http://localhost/api/v1/stores/${TEST_UUID}/merge`, { source_store_id: TEST_UUID_2 }), params(TEST_UUID))

    expect(response.status).toBe(200)
    expect((await response.json()).data).toMatchObject({ id: TEST_UUID, receipt_count: 7 })
  })

  it('answers 422 when merging a store into itself or with an invalid source id', async () => {
    signIn()
    const self = await MERGE(json('POST', `http://localhost/api/v1/stores/${TEST_UUID}/merge`, { source_store_id: TEST_UUID }), params(TEST_UUID))
    const bad = await MERGE(json('POST', `http://localhost/api/v1/stores/${TEST_UUID}/merge`, { source_store_id: 'x' }), params(TEST_UUID))
    expect(self.status).toBe(422)
    expect(bad.status).toBe(422)
  })

  it('answers 404 when either store is not the user’s', async () => {
    signIn({ rpcResults: { merge_stores: { data: null, error: { code: 'P0002', message: 'Store not found' } } } })
    const response = await MERGE(json('POST', `http://localhost/api/v1/stores/${TEST_UUID}/merge`, { source_store_id: TEST_UUID_2 }), params(TEST_UUID))
    expect(response.status).toBe(404)
  })
})
