import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createSupabaseMock, sequentialFrom, TEST_UUID } from '@/test/helpers'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { GET, POST } from '../route'

const mockedAuth = vi.mocked(createAuthenticatedClient)

function signIn(opts?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(opts)
  mockedAuth.mockResolvedValue({ supabase, user: { id: 'user-1' } } as never)
  return supabase
}

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/v1/base-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )

describe('POST /api/v1/base-lists', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('creates the list in the default group when group_id is omitted', async () => {
    const list = { id: 'list-1', name: 'Weekly', group_id: 'default-group' }
    const supabase = signIn({ rpcResults: { ensure_default_group: { data: 'default-group', error: null } } })
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null }, // the name is free
        { data: list, error: null }, // insert
      ],
    })

    const response = await post({ name: 'Weekly' })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ data: list })
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_default_group', { p_group_name: 'My Lists' })
  })

  it('creates the list in the given group when it is the user’s own', async () => {
    const list = { id: 'list-1', name: 'Weekly', group_id: TEST_UUID }
    const supabase = signIn()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null },
        { data: list, error: null },
      ],
      groups: [{ data: { id: TEST_UUID }, error: null }],
    })

    const response = await post({ group_id: TEST_UUID, name: 'Weekly' })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ data: list })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 404 for a group that is not the user’s and creates nothing', async () => {
    const supabase = signIn()
    const insertSpy = vi.fn()
    const builders = sequentialFrom({
      base_lists: [{ data: null, error: null }],
      groups: [{ data: null, error: null }],
    })
    supabase.from = vi.fn().mockImplementation((table: string) => {
      const builder = builders(table)
      if (table === 'base_lists') builder.insert = insertSpy
      return builder
    })

    const response = await post({ group_id: TEST_UUID, name: 'Weekly' })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error.message).toBe('Group not found')
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('answers 409 when another list of the user, in any group, has the name', async () => {
    const supabase = signIn()
    supabase.from = sequentialFrom({ base_lists: [{ data: { id: 'other' }, error: null }] })

    const response = await post({ name: 'Weekly' })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.error.message).toBe('A list with this name already exists. Please choose a different name.')
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('answers 422 for an invalid body and touches nothing', async () => {
    const supabase = signIn()

    const response = await post({ name: '' })

    expect(response.status).toBe(422)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('answers 422 for a group_id that is not a UUID', async () => {
    signIn()

    const response = await post({ group_id: 'not-a-uuid', name: 'Weekly' })

    expect(response.status).toBe(422)
  })

  it('answers 500 with a generic message when the default group cannot be created', async () => {
    const supabase = signIn({
      rpcResults: { ensure_default_group: { data: null, error: { message: 'relation "groups" secret', code: '42P01' } } },
    })
    supabase.from = sequentialFrom({ base_lists: [{ data: null, error: null }] })

    const response = await post({ name: 'Weekly' })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(JSON.stringify(body)).not.toContain('secret')
  })

  it('answers 401 when nobody is signed in', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    const response = await post({ name: 'Weekly' })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/v1/base-lists', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns notes and created_at with each list, ordered by name then creation', async () => {
    const lists = [
      { id: 'a', name: 'Weekly', notes: 'Family', group_id: 'g1', created_at: '2026-01-01T00:00:00Z', items: [{ count: 3 }] },
    ]
    const supabase = signIn()
    const builder = sequentialFrom({ base_lists: [{ data: lists, error: null }] })('base_lists')
    supabase.from = vi.fn().mockReturnValue(builder)

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: lists })
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining('notes'))
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining('created_at'))
    expect(builder.order.mock.calls).toEqual([
      ['name', { ascending: true }],
      ['created_at', { ascending: true }],
    ])
  })

  it('answers 401 when nobody is signed in', async () => {
    mockedAuth.mockRejectedValue(new ApiServiceError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized'))

    const response = await GET()

    expect(response.status).toBe(401)
  })
})
