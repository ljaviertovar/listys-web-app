import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSupabaseMock,
  sequentialFrom,
  TEST_UUID,
  TEST_UUID_2,
} from '@/__tests__/helpers'

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
} from '@/actions/base-lists'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

const mockedCreateClient = vi.mocked(createClient)

function setupMock(overrides?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(overrides)
  mockedCreateClient.mockResolvedValue(supabase as any)
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

  it('rejects duplicate list name within group', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: { id: 'existing' }, error: null }, // dedup finds match
      ],
    })

    const result = await createBaseList({ group_id: TEST_UUID, name: 'Existing' })
    expect(result.error).toContain('already exists')
  })

  it('creates list on happy path', async () => {
    const newList = { id: 'new-id', name: 'Weekly', group_id: TEST_UUID }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      base_lists: [
        { data: null, error: null },      // dedup — no duplicate
        { data: newList, error: null },    // insert
      ],
    })

    const result = await createBaseList({ group_id: TEST_UUID, name: 'Weekly' })
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
