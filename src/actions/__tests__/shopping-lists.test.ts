import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSupabaseMock,
  sequentialFrom,
  TEST_UUID,
} from '@/__tests__/helpers'

// --- Module mocks ---
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroups,
  getGroup,
} from '@/actions/shopping-lists'
import { MAX_GROUPS_PER_USER } from '@/lib/config/limits'

const mockedCreateClient = vi.mocked(createClient)

function setupMock(overrides?: Parameters<typeof createSupabaseMock>[0]) {
  const { supabase } = createSupabaseMock(overrides)
  mockedCreateClient.mockResolvedValue(supabase as any)
  return supabase
}

// ────────────────────────────────────
// Auth guard (applies to every action)
// ────────────────────────────────────
describe('Auth guard', () => {
  beforeEach(() => setupMock({ user: null }))

  it('createGroup returns Unauthorized', async () => {
    expect(await createGroup({ name: 'X' })).toEqual({ error: 'Unauthorized' })
  })

  it('updateGroup returns Unauthorized', async () => {
    expect(await updateGroup(TEST_UUID, { name: 'X' })).toEqual({ error: 'Unauthorized' })
  })

  it('deleteGroup returns Unauthorized', async () => {
    expect(await deleteGroup(TEST_UUID)).toEqual({ error: 'Unauthorized' })
  })

  it('getGroups returns Unauthorized', async () => {
    expect(await getGroups()).toEqual({ error: 'Unauthorized' })
  })

  it('getGroup returns Unauthorized', async () => {
    expect(await getGroup(TEST_UUID)).toEqual({ error: 'Unauthorized' })
  })
})

// ────────────────────────────────────
// createGroup
// ────────────────────────────────────
describe('createGroup', () => {
  it('returns validation error for empty name', async () => {
    setupMock()
    const result = await createGroup({ name: '' })
    expect(result.error).toBeTruthy()
  })

  it('enforces MAX_GROUPS_PER_USER limit', async () => {
    const supabase = setupMock()
    // First from('groups') call → count query
    supabase.from = sequentialFrom({
      groups: [{ count: MAX_GROUPS_PER_USER, error: null }],
    })

    const result = await createGroup({ name: 'New Group' })
    expect(result.error).toContain('maximum limit')
  })

  it('rejects duplicate group name', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [
        { count: 0, error: null },            // limit check passes
        { data: { id: 'existing' }, error: null }, // dedup finds match
      ],
    })

    const result = await createGroup({ name: 'Existing Group' })
    expect(result.error).toContain('already exists')
  })

  it('creates group on happy path', async () => {
    const newGroup = { id: 'new-id', name: 'Groceries', user_id: 'test-user-id' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [
        { count: 0, error: null },       // limit check
        { data: null, error: null },      // dedup — no duplicate
        { data: newGroup, error: null },  // insert
      ],
    })

    const result = await createGroup({ name: 'Groceries' })
    expect(result.data).toEqual(newGroup)
  })
})

// ────────────────────────────────────
// updateGroup
// ────────────────────────────────────
describe('updateGroup', () => {
  it('returns validation error for empty name', async () => {
    setupMock()
    const result = await updateGroup(TEST_UUID, { name: '' })
    expect(result.error).toBeTruthy()
  })

  it('rejects duplicate name excluding self', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [
        { data: { id: 'other-group' }, error: null }, // dedup finds another group with same name
      ],
    })

    const result = await updateGroup(TEST_UUID, { name: 'Taken' })
    expect(result.error).toContain('already exists')
  })

  it('updates group on happy path', async () => {
    const updated = { id: TEST_UUID, name: 'Renamed' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [
        { data: null, error: null },      // dedup — no duplicate
        { data: updated, error: null },   // update
      ],
    })

    const result = await updateGroup(TEST_UUID, { name: 'Renamed' })
    expect(result.data).toEqual(updated)
  })
})

// ────────────────────────────────────
// deleteGroup
// ────────────────────────────────────
describe('deleteGroup', () => {
  it('returns success on delete', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [{ data: null, error: null }],
    })

    const result = await deleteGroup(TEST_UUID)
    expect(result).toEqual({ success: true })
  })

  it('returns error from supabase on failure', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [{ error: { message: 'FK constraint' } }],
    })

    const result = await deleteGroup(TEST_UUID)
    expect(result.error).toBe('FK constraint')
  })
})

// ────────────────────────────────────
// getGroups
// ────────────────────────────────────
describe('getGroups', () => {
  it('returns list of groups', async () => {
    const groups = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }]
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [{ data: groups, error: null }],
    })

    const result = await getGroups()
    expect(result.data).toEqual(groups)
  })
})

// ────────────────────────────────────
// getGroup
// ────────────────────────────────────
describe('getGroup', () => {
  it('returns a single group', async () => {
    const group = { id: TEST_UUID, name: 'My Group' }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      groups: [{ data: group, error: null }],
    })

    const result = await getGroup(TEST_UUID)
    expect(result.data).toEqual(group)
  })
})
