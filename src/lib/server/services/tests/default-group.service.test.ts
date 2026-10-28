import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ApiServiceError } from '@/lib/api/http'
import { resolveListGroupId } from '../default-group.service'

type Result = { data?: unknown; error?: { message: string; code?: string } | null }

function client({ group, rpc }: { group?: Result; rpc?: Result }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null, ...group })
  const eq = vi.fn()
  const chain = { select: vi.fn(), eq, maybeSingle }
  chain.select.mockReturnValue(chain)
  eq.mockReturnValue(chain)
  const rpcFn = vi.fn().mockResolvedValue({ data: null, error: null, ...rpc })
  const from = vi.fn().mockReturnValue(chain)
  return { supabase: { from, rpc: rpcFn } as never, from, rpc: rpcFn, eq }
}

describe('resolveListGroupId', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('uses a group that belongs to the user, scoped by id and owner, without calling the default-group function', async () => {
    const { supabase, rpc, eq } = client({ group: { data: { id: 'group-1' } } })

    await expect(resolveListGroupId(supabase, 'user-1', 'group-1')).resolves.toBe('group-1')
    expect(eq).toHaveBeenCalledWith('id', 'group-1')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('answers 404 for a group that is not found, which is also what another user’s group looks like', async () => {
    const { supabase, rpc } = client({ group: { data: null } })

    await expect(resolveListGroupId(supabase, 'user-1', 'foreign-group')).rejects.toMatchObject({
      status: 404,
      message: 'Group not found',
    })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('creates or finds the default group when no group is given', async () => {
    const { supabase, rpc, from } = client({ rpc: { data: 'default-group' } })

    await expect(resolveListGroupId(supabase, 'user-1')).resolves.toBe('default-group')
    expect(rpc).toHaveBeenCalledWith('ensure_default_group', { p_group_name: 'My Lists' })
    expect(from).not.toHaveBeenCalled()
  })

  it('treats an empty group id like a missing one', async () => {
    const { supabase, rpc } = client({ rpc: { data: 'default-group' } })

    await expect(resolveListGroupId(supabase, 'user-1', null)).resolves.toBe('default-group')
    expect(rpc).toHaveBeenCalledTimes(1)
  })

  it('fails with a generic message and logs only the code when the database rejects it', async () => {
    const { supabase } = client({ rpc: { error: { message: 'permission denied for table groups "secret"', code: '42501' } } })

    const failure = await resolveListGroupId(supabase, 'user-1').catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(ApiServiceError)
    expect(failure).toMatchObject({ status: 500 })
    expect((failure as Error).message).not.toContain('secret')
    expect(consoleError).toHaveBeenCalledWith('[default-group] could not resolve the default group', { code: '42501' })
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret')
  })

  it('fails when the function returns nothing', async () => {
    const { supabase } = client({ rpc: { data: null } })

    await expect(resolveListGroupId(supabase, 'user-1')).rejects.toMatchObject({ status: 500 })
  })
})
