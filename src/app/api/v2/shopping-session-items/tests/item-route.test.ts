import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthenticatedClient } from '@/lib/api/auth'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'
import { createSupabaseMock } from '@/test/helpers'
import { sessionItemDtoSchema } from '@/lib/validations/shopping-session-item'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { PATCH } from '../[itemId]/route'
import { PATCH as legacyPatch } from '@/app/api/v1/shopping-session-items/[itemId]/route'

const id = '00000000-0000-4000-8000-000000000001'
const item = { id, shopping_session_id: '00000000-0000-4000-8000-000000000002', name: 'Milk', normalized_name: 'milk',
  quantity: 1, unit: null, checked: true, notes: null, category: null, sort_order: 0, price: null,
  is_other_store: false, created_at: null, updated_at: null, version: 2 }
const context = () => ({ params: Promise.resolve({ itemId: id }) })
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost/api/v2/shopping-session-items/${id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  })
}
function authorize(result: { data?: unknown; error?: unknown } = { data: { outcome: 'updated', item } }) {
  const { supabase } = createSupabaseMock({ rpcResults: { update_shopping_session_item_versioned: result } })
  vi.mocked(createAuthenticatedClient).mockResolvedValue({ supabase, user: { id: 'owner' } } as never)
  return supabase
}

beforeEach(() => { vi.clearAllMocks() })

describe('versioned session item HTTP contract', () => {
  it('returns an explicit versioned DTO and sends a conditional mutation', async () => {
    const supabase = authorize({ data: { outcome: 'updated', item: { ...item, private_column: 'never returned' } } })
    const response = await PATCH(request({ checked: true, expected_version: 1 }), context())
    const payload = await response.json()
    expect(response.status).toBe(200)
    expect(sessionItemDtoSchema.parse(payload.data)).toEqual(item)
    expect(payload.data).not.toHaveProperty('private_column')
    expect(supabase.rpc).toHaveBeenCalledWith('update_shopping_session_item_versioned', {
      p_item_id: id, p_expected_version: 1, p_fields: { checked: true },
    })
  })

  it('returns an authorized current DTO in a version conflict', async () => {
    authorize({ data: { outcome: 'conflict', item } })
    const response = await PATCH(request({ checked: false, expected_version: 1 }), context())
    const payload = await response.json()
    expect(response.status).toBe(409)
    expect(payload.error.code).toBe('ITEM_VERSION_CONFLICT')
    expect(payload.error.request_id).toBeTruthy()
    expect(payload.error.details.current_item).toEqual(item)
  })

  it.each([
    ['ITEM_NOT_FOUND', 404, 'NOT_FOUND'],
    ['SESSION_NOT_ACTIVE', 409, 'SESSION_NOT_ACTIVE'],
    ['UNAUTHORIZED', 401, 'UNAUTHORIZED'],
    ['INVALID_ITEM_FIELDS', 422, 'VALIDATION_ERROR'],
  ])('maps database outcome %s without provider details', async (message, status, code) => {
    authorize({ error: { message, code: 'P0001' } })
    const response = await PATCH(request({ checked: true, expected_version: 1 }), context())
    const payload = await response.json()
    expect(response.status).toBe(status)
    expect(payload.error.code).toBe(code)
    expect(payload.error).not.toHaveProperty('details')
  })

  it('requires authentication at the service boundary', async () => {
    vi.mocked(createAuthenticatedClient).mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))
    expect((await PATCH(request({ checked: true, expected_version: 1 }), context())).status).toBe(401)
  })

  it.each([{ checked: true }, { expected_version: 0, checked: true }, { expected_version: 1 },
    { expected_version: 1, checked: true, version: 10 }, { expected_version: 1, user_id: id }])('rejects invalid writes before mutation', async body => {
    const supabase = authorize()
    expect((await PATCH(request(body), context())).status).toBe(422)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('rejects foreign origins and unsupported media types', async () => {
    const supabase = authorize()
    expect((await PATCH(request({ expected_version: 1, checked: true }, { origin: 'https://other.test' }), context())).status).toBe(403)
    expect((await PATCH(request({ expected_version: 1, checked: true }, { 'content-type': 'text/plain' }), context())).status).toBe(415)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('uses the public Host when Next exposes an internal localhost URL', async () => {
    authorize()
    const response = await PATCH(request({ checked: true, expected_version: 1 }, {
      origin: 'http://127.0.0.1', host: '127.0.0.1',
    }), context())
    expect(response.status).toBe(200)
  })

  it('sanitizes provider errors and malformed RPC payloads', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    for (const result of [{ error: { message: 'SELECT * FROM private_table', code: '42P01' } }, { data: { broken: true } }]) {
      authorize(result)
      const response = await PATCH(request({ expected_version: 1, checked: true }), context())
      expect(response.status).toBe(500)
      expect(await response.text()).not.toMatch(/SELECT|private_table|ZodError/)
    }
    log.mockRestore()
  })

  it('retires v1 with a reload instruction and successor, without writing', async () => {
    const supabase = authorize()
    const response = await legacyPatch(request({ checked: true }), context())
    expect(response.status).toBe(410)
    expect((await response.json()).error.code).toBe('CLIENT_UPDATE_REQUIRED')
    expect(response.headers.get('Link')).toContain(`/api/v2/shopping-session-items/${id}`)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
