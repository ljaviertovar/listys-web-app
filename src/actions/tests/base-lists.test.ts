import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSupabaseMock,
  sequentialFrom,
  TEST_UUID,
  TEST_UUID_2,
} from '@/test/helpers'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import {
  createBaseList,
  updateBaseList,
  deleteBaseList,
  getBaseList,
  getBaseLists,
  createBaseListItem,
  updateBaseListItem,
  deleteBaseListItem,
} from '@/actions'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

const mockedCreateClient = vi.mocked(createClient)

function setupMock(overrides?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(overrides)
  mockedCreateClient.mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>)
  return supabase
}

// ────────────────────────────────────
// Auth guard
// ────────────────────────────────────
describe('Auth guard', () => {
  beforeEach(() => setupMock({ user: null }))

  it.each([
    ['createBaseList', () => createBaseList({ group_id: TEST_UUID, name: 'X' })],
    ['updateBaseList', () => updateBaseList(TEST_UUID, { name: 'X' })],
    ['deleteBaseList', () => deleteBaseList(TEST_UUID)],
    ['getBaseList', () => getBaseList(TEST_UUID)],
    ['getBaseLists', () => getBaseLists()],
    ['createBaseListItem', () => createBaseListItem({ base_list_id: TEST_UUID, name: 'Milk' })],
    ['updateBaseListItem', () => updateBaseListItem(TEST_UUID, { name: 'Eggs' })],
    ['deleteBaseListItem', () => deleteBaseListItem(TEST_UUID)],
  ])('%s returns Unauthorized', async (_name, fn) => {
    expect(await fn()).toEqual({ error: 'Unauthorized' })
  })
})

// ────────────────────────────────────
// createBaseList
// ────────────────────────────────────
describe('createBaseList', () => {
  it('returns validation error for missing name', async () => {
    setupMock()
    const result = await createBaseList({ group_id: TEST_UUID })
    expect(result.error).toBeTruthy()
  })

  it('rejects a name already used by another list of the user, in any group', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: { id: 'existing' }, error: null }, // the name is taken
      ],
    })

    const result = await createBaseList({ name: 'Existing' })
    expect(result.error).toBe('A list with this name already exists. Please choose a different name.')
    expect(result.error).not.toMatch(/group/i)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('creates the list in the default group when no group is given', async () => {
    const newList = { id: 'new-id', name: 'Weekly', group_id: 'default-group' }
    const { supabase } = createSupabaseMock({ rpcResults: { ensure_default_group: { data: 'default-group', error: null } } })
    mockedCreateClient.mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>)
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null }, // name is free
        { data: newList, error: null }, // insert
      ],
    })

    const result = await createBaseList({ name: 'Weekly' })

    expect(result.data).toEqual(newList)
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_default_group', { p_group_name: 'My Lists' })
  })

  it('creates the list in an own group when one is given', async () => {
    const newList = { id: 'new-id', name: 'Weekly', group_id: TEST_UUID }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null }, // name is free
        { data: newList, error: null }, // insert
      ],
      groups: [{ data: { id: TEST_UUID }, error: null }], // the group is the user's own
    })

    const result = await createBaseList({ group_id: TEST_UUID, name: 'Weekly' })
    expect(result.data).toEqual(newList)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('refuses a group that is not the user\u2019s and creates nothing', async () => {
    const supabase = setupMock()
    const insertSpy = vi.fn()
    supabase.from = vi.fn().mockImplementation((table: string) => {
      const builder = sequentialFrom({
        base_lists: [{ data: null, error: null }],
        groups: [{ data: null, error: null }],
      })(table)
      if (table === 'base_lists') builder.insert = insertSpy
      return builder
    })

    const result = await createBaseList({ group_id: TEST_UUID, name: 'Weekly' })
    expect(result.error).toBe('Group not found')
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('returns a generic error and creates nothing when the default group cannot be created', async () => {
    const { supabase } = createSupabaseMock({
      rpcResults: { ensure_default_group: { data: null, error: { message: 'permission denied "secret"', code: '42501' } } },
    })
    mockedCreateClient.mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>)
    const insertSpy = vi.fn()
    supabase.from = vi.fn().mockImplementation(() => {
      const builder = sequentialFrom({ base_lists: [{ data: null, error: null }] })('base_lists')
      builder.insert = insertSpy
      return builder
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await createBaseList({ name: 'Weekly' })

    expect(result.error).toBe('We couldn\u2019t create your list. Try again.')
    expect(JSON.stringify(result)).not.toContain('secret')
    expect(insertSpy).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('creates list with notes on happy path', async () => {
    const newList = { id: 'new-id-2', name: 'Weekly', group_id: 'default-group', notes: 'Family grocery list' }
    const { supabase } = createSupabaseMock({ rpcResults: { ensure_default_group: { data: 'default-group', error: null } } })
    mockedCreateClient.mockResolvedValue(supabase as unknown as Awaited<ReturnType<typeof createClient>>)
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null }, // name is free
        { data: newList, error: null }, // insert
      ],
    })

    const result = await createBaseList({ name: 'Weekly', notes: 'Family grocery list' })

    expect(result.data).toEqual(newList)
  })
})

// ────────────────────────────────────
// createBaseListItem
// ────────────────────────────────────
describe('createBaseListItem', () => {
  it('returns validation error for invalid quantity', async () => {
    setupMock()
    const result = await createBaseListItem({
      base_list_id: TEST_UUID,
      name: 'Milk',
      quantity: 1.15, // not a 0.1 step
    })
    expect(result.error).toBeTruthy()
  })

  it('enforces MAX_ITEMS_PER_BASE_LIST limit', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_list_items: [
        { count: MAX_ITEMS_PER_BASE_LIST, error: null }, // limit reached
      ],
    })

    const result = await createBaseListItem({
      base_list_id: TEST_UUID,
      name: 'Milk',
    })
    expect(result.error).toContain('maximum limit')
  })

  it('inserts item on happy path', async () => {
    const newItem = { id: 'item-1', name: 'Milk', quantity: 1 }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_list_items: [
        { count: 0, error: null },        // limit check
        { data: newItem, error: null },    // insert
      ],
    })

    const result = await createBaseListItem({
      base_list_id: TEST_UUID,
      name: 'Milk',
    })
    expect(result.data).toEqual(newItem)
  })
})

// ────────────────────────────────────
// deleteBaseList
// ────────────────────────────────────
describe('deleteBaseList', () => {
  it('returns success', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [{ data: null, error: null }],
    })

    const result = await deleteBaseList(TEST_UUID)
    expect(result).toEqual({ success: true })
  })
})

// ────────────────────────────────────
// getBaseList
// ────────────────────────────────────
describe('getBaseList', () => {
  it('returns list with items', async () => {
    const list = {
      id: TEST_UUID,
      name: 'Weekly',
      items: [{ id: 'i1', name: 'Milk' }],
      is_owner: false,
    }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [{ data: list, error: null }],
    })

    const result = await getBaseList(TEST_UUID)
    expect(result.data).toEqual(list)
  })
})

// ────────────────────────────────────
// getBaseLists
// ────────────────────────────────────
describe('getBaseLists', () => {
  it('returns list of base lists', async () => {
    const lists = [{ id: '1', name: 'A', group_id: TEST_UUID }]
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [{ data: lists, error: null }],
    })

    const result = await getBaseLists()
    expect(result.data).toEqual(lists)
  })
})

// ────────────────────────────────────
// updateBaseList
// ────────────────────────────────────
describe('updateBaseList', () => {
  it('returns validation error for notes longer than 500 chars', async () => {
    setupMock()
    const result = await updateBaseList(TEST_UUID, {
      notes: 'a'.repeat(501),
    })

    expect(result.error).toBeTruthy()
  })

  it('updates list name and notes on happy path', async () => {
    const updated = { id: TEST_UUID, name: 'Weekly Updated', notes: 'Main grocery run' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: { name: 'Weekly' }, error: null }, // get current list
        { data: null, error: null }, // the new name is free
        { data: updated, error: null }, // update
      ],
    })

    const result = await updateBaseList(TEST_UUID, {
      name: 'Weekly Updated',
      notes: 'Main grocery run',
    })

    expect(result.data).toEqual(updated)
  })

  it('rejects a name used by another list of the user, whatever its group', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: { name: 'Weekly' }, error: null }, // current list
        { data: { id: 'other' }, error: null }, // another list already has the new name
      ],
    })

    const result = await updateBaseList(TEST_UUID, { name: 'Costco' })
    expect(result.error).toBe('A list with this name already exists. Please choose a different name.')
  })

  it('accepts saving the same name, or only changing its case, even when a legacy twin exists', async () => {
    const updated = { id: TEST_UUID, name: 'weekly' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: { name: 'Weekly' }, error: null }, // current list
        { data: updated, error: null }, // update: no duplicate lookup happens
      ],
    })

    const result = await updateBaseList(TEST_UUID, { name: 'weekly' })
    expect(result.data).toEqual(updated)
  })

  it('updates notes only without duplicate-name lookup', async () => {
    const updated = { id: TEST_UUID, name: 'Weekly', notes: null }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: updated, error: null }, // update only
      ],
    })

    const result = await updateBaseList(TEST_UUID, {
      notes: null,
    })

    expect(result.data).toEqual(updated)
  })
})

// ────────────────────────────────────
// updateBaseListItem
// ────────────────────────────────────
describe('updateBaseListItem', () => {
  it('returns validation error for invalid quantity step', async () => {
    setupMock()
    const result = await updateBaseListItem(TEST_UUID, { quantity: 2.55 })
    expect(result.error).toBeTruthy()
  })

  it('updates item on happy path', async () => {
    const updated = { id: TEST_UUID, name: 'Eggs', quantity: 2 }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_list_items: [
        { data: { base_list_id: TEST_UUID_2 }, error: null }, // get existing
        { data: updated, error: null }, // update
      ],
    })

    const result = await updateBaseListItem(TEST_UUID, { name: 'Eggs' })
    expect(result.data).toEqual(updated)
  })
})

// ────────────────────────────────────
// deleteBaseListItem
// ────────────────────────────────────
describe('deleteBaseListItem', () => {
  it('returns success', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_list_items: [
        { data: { base_list_id: TEST_UUID_2 }, error: null }, // get existing
        { data: null, error: null },  // delete
      ],
    })

    const result = await deleteBaseListItem(TEST_UUID)
    expect(result).toEqual({ success: true })
  })
})
