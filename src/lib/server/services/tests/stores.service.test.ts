import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { createQueryBuilder, createSupabaseMock, TEST_UUID, TEST_UUID_2 } from '@/test/helpers'
import { MAX_STORES_PER_USER } from '@/lib/config/limits'

vi.mock('@/lib/api/auth', () => ({ createAuthenticatedClient: vi.fn() }))

import { createAuthenticatedClient } from '@/lib/api/auth'
import { createStore, listStores, mergeStores, renameStore } from '../stores.service'
import { mapRpcError } from '../rpc-errors'

const mockedAuth = vi.mocked(createAuthenticatedClient)
const ROW = { id: TEST_UUID, name: 'No Frills', created_at: '2026-10-25T00:00:00Z', updated_at: '2026-10-25T00:00:00Z' }

function signIn(opts?: Parameters<typeof createSupabaseMock>[0]) {
  const mock = createSupabaseMock(opts)
  mockedAuth.mockResolvedValue({ supabase: mock.supabase, user: { id: 'user-1' } } as never)
  return mock
}

describe('mapRpcError', () => {
  let consoleError: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => consoleError.mockRestore())

  it('maps not found to 404 and keeps only our own messages', () => {
    expect(mapRpcError({ code: 'P0002', message: 'Store not found' }, 't')).toMatchObject({ status: 404, message: 'Store not found' })
    expect(mapRpcError({ code: 'P0002', message: 'row in table secret' }, 't')).toMatchObject({ status: 404, message: 'Not found' })
  })

  it('maps validation errors to 422 without leaking database text', () => {
    expect(mapRpcError({ code: '22023', message: 'A linked item is not in this list' }, 't')).toMatchObject({
      status: 422,
      message: 'A linked item is not in this list',
    })
    expect(mapRpcError({ code: '22023', message: 'internal detail' }, 't')).toMatchObject({ status: 422, message: 'Invalid request' })
    expect(mapRpcError({ code: '22P02', message: 'invalid input syntax for type uuid: "x"' }, 't')).toMatchObject({
      status: 422,
      message: 'Invalid identifier',
    })
  })

  it('maps a taken name to 409 with the store that has it, only when the detail is an id', () => {
    expect(mapRpcError({ code: '23505', message: 'Store already exists', details: TEST_UUID }, 't')).toMatchObject({
      status: 409,
      code: 'CONFLICT',
      details: { store_id: TEST_UUID },
    })
    expect(mapRpcError({ code: '23505', message: 'duplicate key', details: 'Key (user_id)=(…)' }, 't').details).toBeUndefined()
  })

  it('maps the store and list limits to 409 LIMIT_EXCEEDED', () => {
    expect(mapRpcError({ code: 'P0001', message: 'Store limit reached (50)' }, 't')).toMatchObject({
      status: 409,
      code: 'LIMIT_EXCEEDED',
      message: `You can have up to ${MAX_STORES_PER_USER} stores. Merge stores to make room.`,
    })
    const listLimit = 'Cannot merge items. This would exceed the maximum limit of 250 items per list (current: 249, trying to add: 2).'
    expect(mapRpcError({ code: 'P0001', message: listLimit }, 't')).toMatchObject({ status: 409, code: 'LIMIT_EXCEEDED', message: listLimit })
  })

  it('answers a generic 500 and logs only the code for anything else', () => {
    const error = mapRpcError({ code: '42501', message: 'permission denied for table "secret"' }, 'stores')
    expect(error).toMatchObject({ status: 500 })
    expect(error.message).not.toContain('secret')
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret')
  })
})

describe('stores service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the user’s stores by name with their receipt counts and the limit', async () => {
    const { fromMocks } = signIn({
      tables: { stores: { data: [{ ...ROW, receipts: [{ count: 3 }] }, { ...ROW, id: TEST_UUID_2, name: 'Metro', receipts: [] }], error: null } },
    })

    const result = await listStores()

    expect(result).toEqual({
      stores: [
		{ id: TEST_UUID, name: 'No Frills', receipt_count: 3, created_at: ROW.created_at, updated_at: ROW.updated_at, last_visit: null },
		{ id: TEST_UUID_2, name: 'Metro', receipt_count: 0, created_at: ROW.created_at, updated_at: ROW.updated_at, last_visit: null },
      ],
      meta: { count: 2, limit: MAX_STORES_PER_USER },
    })
    expect(fromMocks.stores.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(fromMocks.stores.order).toHaveBeenCalledWith('name', { ascending: true })
    expect(fromMocks.stores.limit).toHaveBeenCalledWith(MAX_STORES_PER_USER)
  })

  it('creates a store through the database function with the limit and a cleaned name', async () => {
    const { supabase } = signIn({ rpcResults: { create_store: { data: { ...ROW, user_id: 'user-1', normalized_name: 'nofrills' }, error: null } } })

    const store = await createStore({ name: '  No   Frills ' })

    expect(supabase.rpc).toHaveBeenCalledWith('create_store', { p_name: 'No Frills', p_max_stores: MAX_STORES_PER_USER })
		expect(store).toEqual({ id: TEST_UUID, name: 'No Frills', receipt_count: 0, created_at: ROW.created_at, updated_at: ROW.updated_at, last_visit: null })
    expect(store).not.toHaveProperty('user_id')
  })

  it('rejects a blank or too long name before calling the database', async () => {
    const { supabase } = signIn()

    await expect(createStore({ name: '   ' })).rejects.toMatchObject({ status: 422 })
    await expect(createStore({ name: 'x'.repeat(101) })).rejects.toMatchObject({ status: 422 })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('reports a taken name with the id of the store that has it', async () => {
    signIn({ rpcResults: { create_store: { data: null, error: { code: '23505', message: 'Store already exists', details: TEST_UUID_2 } } } })

    await expect(createStore({ name: 'no-frills' })).rejects.toMatchObject({ status: 409, details: { store_id: TEST_UUID_2 } })
  })

  it('renames a store and returns it with its receipt count', async () => {
    const { supabase } = signIn({ rpcResults: { rename_store: { data: { ...ROW, name: 'Metro' }, error: null } } })
    supabase.from = vi.fn().mockReturnValue(createQueryBuilder({ count: 4, error: null }))

    await expect(renameStore(TEST_UUID, { name: 'Metro' })).resolves.toMatchObject({ name: 'Metro', receipt_count: 4 })
    expect(supabase.rpc).toHaveBeenCalledWith('rename_store', { p_store_id: TEST_UUID, p_name: 'Metro' })
  })

  it('answers 404 when renaming a store that is not the user’s', async () => {
    signIn({ rpcResults: { rename_store: { data: null, error: { code: 'P0002', message: 'Store not found' } } } })

    await expect(renameStore(TEST_UUID, { name: 'Metro' })).rejects.toMatchObject({ status: 404 })
  })

  it('merges a store into another and returns the target with its new receipt count', async () => {
    const { supabase } = signIn({ rpcResults: { merge_stores: { data: ROW, error: null } } })
    supabase.from = vi.fn().mockReturnValue(createQueryBuilder({ count: 7, error: null }))

    await expect(mergeStores(TEST_UUID, { source_store_id: TEST_UUID_2 })).resolves.toMatchObject({ id: TEST_UUID, receipt_count: 7 })
    expect(supabase.rpc).toHaveBeenCalledWith('merge_stores', { p_target_id: TEST_UUID, p_source_id: TEST_UUID_2 })
  })

  it('refuses to merge a store into itself without calling the database', async () => {
    const { supabase } = signIn()

    await expect(mergeStores(TEST_UUID, { source_store_id: TEST_UUID })).rejects.toMatchObject({ status: 422 })
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
