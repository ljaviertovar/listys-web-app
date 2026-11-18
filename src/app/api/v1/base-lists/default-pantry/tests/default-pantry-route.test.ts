import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createSupabaseMock, TEST_UUID } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { POST } from '../route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(rpcResult: { data?: unknown; error?: { message: string; code?: string } | null }) {
  const { supabase } = createSupabaseMock({ rpcResults: { create_default_pantry: rpcResult } })
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

describe('POST /api/v1/base-lists/default-pantry', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('answers 201 with the new list when the Pantry was created', async () => {
    const supabase = signIn({ data: { list_id: TEST_UUID, outcome: 'created' }, error: null })

    const response = await POST()

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ data: { id: TEST_UUID, outcome: 'created' } })
    expect(supabase.rpc).toHaveBeenCalledWith('create_default_pantry', { p_group_name: 'My Lists', p_list_name: 'Pantry' })
  })

  it.each(['adopted', 'existing'] as const)('answers 200 when the outcome is %s', async outcome => {
    signIn({ data: { list_id: TEST_UUID, outcome }, error: null })

    const response = await POST()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { id: TEST_UUID, outcome } })
  })

  it('answers 401 without a session and does not call the database', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    const response = await POST()

    expect(response.status).toBe(401)
  })

  it('answers a generic 500 and never leaks the database message', async () => {
    signIn({ error: { message: 'permission denied for table groups "secret"', code: '42501' } })

    const response = await POST()
    const body = JSON.stringify(await response.json())

    expect(response.status).toBe(500)
    expect(body).not.toContain('secret')
    expect(body).toContain('We couldn’t set up your Pantry')
  })
})
