import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { ensureDefaultPantry } from '../default-pantry.service'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function mockRpc(result: { data?: unknown; error?: { message: string; code?: string } | null }) {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null, ...result })
  mockedAuth.mockResolvedValue({ supabase: { rpc }, user: { id: 'user-1' } } as never)
  return rpc
}

describe('ensureDefaultPantry', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('passes the default names and reports that the list was created', async () => {
    const rpc = mockRpc({ data: true })

    await expect(ensureDefaultPantry()).resolves.toBe(true)
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('ensure_default_pantry', { p_group_name: 'My Lists', p_list_name: 'Pantry' })
  })

  it('reports false when the account was already provisioned or has lists', async () => {
    mockRpc({ data: false })

    await expect(ensureDefaultPantry()).resolves.toBe(false)
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('resolves false without calling the database when nobody is signed in', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    await expect(ensureDefaultPantry()).resolves.toBe(false)
  })

  it('never throws and logs only the error code when the RPC fails', async () => {
    mockRpc({ error: { message: 'permission denied for table groups "secret"', code: '42501' } })

    await expect(ensureDefaultPantry()).resolves.toBe(false)
    expect(consoleError).toHaveBeenCalledWith('[default-pantry] provisioning failed', { code: '42501' })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret')
  })

  it('never throws when the call itself rejects', async () => {
    mockedAuth.mockResolvedValue({
      supabase: { rpc: vi.fn().mockRejectedValue(new Error('network down with details')) },
      user: { id: 'user-1' },
    } as never)

    await expect(ensureDefaultPantry()).resolves.toBe(false)
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('network down')
  })
})
