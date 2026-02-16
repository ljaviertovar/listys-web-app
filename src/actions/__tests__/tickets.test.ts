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
  getTickets,
  getTicket,
  mergeTicketItemsToBaseList,
  createBaseListFromTicket,
  deleteTicket,
  assignTicketToGroup,
  markStuckTicketsAsFailed,
} from '@/actions/tickets'
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
    ['getTickets', () => getTickets()],
    ['getTicket', () => getTicket(TEST_UUID)],
    ['mergeTicketItemsToBaseList', () => mergeTicketItemsToBaseList({
      ticket_id: TEST_UUID,
      base_list_id: TEST_UUID_2,
      items: [{ id: TEST_UUID, merge: true }],
    })],
    ['createBaseListFromTicket', () => createBaseListFromTicket({
      ticket_id: TEST_UUID,
      group_id: TEST_UUID_2,
      name: 'List',
      item_ids: [TEST_UUID],
    })],
    ['deleteTicket', () => deleteTicket(TEST_UUID)],
    ['assignTicketToGroup', () => assignTicketToGroup(TEST_UUID, TEST_UUID_2)],
    ['markStuckTicketsAsFailed', () => markStuckTicketsAsFailed()],
  ])('%s returns Unauthorized', async (_name, fn) => {
    expect(await fn()).toEqual({ error: 'Unauthorized' })
  })
})

// ────────────────────────────────────
// getTickets
// ────────────────────────────────────
describe('getTickets', () => {
  it('returns list of tickets', async () => {
    const tickets = [{ id: '1', ocr_status: 'completed' }]
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [{ data: tickets, error: null }],
    })

    const result = await getTickets()
    expect(result.data).toEqual(tickets)
  })
})

// ────────────────────────────────────
// mergeTicketItemsToBaseList
// ────────────────────────────────────
describe('mergeTicketItemsToBaseList', () => {
  it('returns error when no items selected for merge', async () => {
    const supabase = setupMock()

    const result = await mergeTicketItemsToBaseList({
      ticket_id: TEST_UUID,
      base_list_id: TEST_UUID_2,
      items: [{ id: TEST_UUID, merge: false }], // none selected
    })
    expect(result.error).toBe('No items to merge')
  })

  it('calls merge RPC and returns counts on success', async () => {
    const supabase = setupMock({
      rpcResults: {
        merge_ticket_items_to_base_list: {
          data: { new_count: 3, updated_count: 1, skipped_count: 0 },
          error: null,
        },
      },
    })

    const result = await mergeTicketItemsToBaseList({
      ticket_id: TEST_UUID,
      base_list_id: TEST_UUID_2,
      items: [
        { id: TEST_UUID, merge: true },
        { id: TEST_UUID_2, merge: true },
      ],
    })
    expect(result).toMatchObject({
      success: true,
      new_count: 3,
      updated_count: 1,
      skipped_count: 0,
    })
  })

  it('returns error when RPC fails', async () => {
    const supabase = setupMock({
      rpcResults: {
        merge_ticket_items_to_base_list: { data: null, error: { message: 'RPC error' } },
      },
    })

    const result = await mergeTicketItemsToBaseList({
      ticket_id: TEST_UUID,
      base_list_id: TEST_UUID_2,
      items: [{ id: TEST_UUID, merge: true }],
    })
    expect(result.error).toBe('RPC error')
  })
})

// ────────────────────────────────────
// createBaseListFromTicket
// ────────────────────────────────────
describe('createBaseListFromTicket', () => {
  it('returns error when no ticket items found', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      ticket_items: [{ data: [], error: null }],
    })

    const result = await createBaseListFromTicket({
      ticket_id: TEST_UUID,
      group_id: TEST_UUID_2,
      name: 'New List',
      item_ids: [TEST_UUID],
    })
    expect(result.error).toBe('No items to add')
  })

  it('rejects when items exceed MAX_ITEMS_PER_BASE_LIST', async () => {
    const genUUID = (i: number) => `${String(i).padStart(8, '0')}-0000-4000-a000-${String(i).padStart(12, '0')}`
    const tooManyItems = Array.from({ length: MAX_ITEMS_PER_BASE_LIST + 1 }, (_, i) => ({
      id: genUUID(i),
      name: `Item ${i}`,
      quantity: 1,
    }))
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      ticket_items: [{ data: tooManyItems, error: null }],
    })

    const result = await createBaseListFromTicket({
      ticket_id: TEST_UUID,
      group_id: TEST_UUID_2,
      name: 'New List',
      item_ids: tooManyItems.map(i => i.id),
    })
    expect(result.error).toContain('Cannot add more than')
  })

  it('creates list and inserts items on happy path', async () => {
    const itemUUID = '00000001-0000-4000-a000-000000000001'
    const newList = { id: 'new-list-id', name: 'From Ticket', group_id: TEST_UUID_2 }
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      ticket_items: [{ data: [{ id: itemUUID, name: 'Milk', quantity: 1 }], error: null }],
      base_lists: [{ data: newList, error: null }],
      base_list_items: [{ data: null, error: null }],
      tickets: [{ data: null, error: null }],
    })

    const result = await createBaseListFromTicket({
      ticket_id: TEST_UUID,
      group_id: TEST_UUID_2,
      name: 'From Ticket',
      item_ids: [itemUUID],
    })
    expect(result.data).toEqual(newList)
  })
})

// ────────────────────────────────────
// deleteTicket
// ────────────────────────────────────
describe('deleteTicket', () => {
  it('removes storage image and deletes ticket', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [
        { data: { image_path: 'user/img.jpg' }, error: null }, // get ticket
        { data: null, error: null }, // delete
      ],
    })

    const result = await deleteTicket(TEST_UUID)
    expect(result).toEqual({ success: true })
    expect(supabase.storage.from).toHaveBeenCalledWith('tickets')
  })

  it('returns error on delete failure', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [
        { data: { image_path: null }, error: null }, // no image
        { error: { message: 'delete failed' } },     // delete error
      ],
    })

    const result = await deleteTicket(TEST_UUID)
    expect(result.error).toBe('delete failed')
  })
})

// ────────────────────────────────────
// assignTicketToGroup
// ────────────────────────────────────
describe('assignTicketToGroup', () => {
  it('returns error when ticket not found', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [{ data: null, error: { message: 'not found' } }],
    })

    const result = await assignTicketToGroup(TEST_UUID, TEST_UUID_2)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when group not found', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [{ data: { id: TEST_UUID }, error: null }],
      groups: [{ data: null, error: { message: 'not found' } }],
    })

    const result = await assignTicketToGroup(TEST_UUID, TEST_UUID_2)
    expect(result.error).toBe('Group not found')
  })

  it('assigns ticket to group on happy path', async () => {
    const supabase = setupMock()
    supabase.from = sequentialFrom({
      tickets: [
        { data: { id: TEST_UUID }, error: null },  // verify ticket
        { data: null, error: null },                // update ticket
      ],
      groups: [
        { data: { id: TEST_UUID_2 }, error: null }, // verify group
      ],
    })

    const result = await assignTicketToGroup(TEST_UUID, TEST_UUID_2)
    expect(result).toEqual({ success: true })
  })
})

// ────────────────────────────────────
// markStuckTicketsAsFailed
// ────────────────────────────────────
describe('markStuckTicketsAsFailed', () => {
  it('calls RPC and returns success', async () => {
    const supabase = setupMock({
      rpcResults: { mark_stuck_tickets_as_failed: { data: null, error: null } },
    })

    const result = await markStuckTicketsAsFailed()
    expect(result).toEqual({ success: true })
    expect(supabase.rpc).toHaveBeenCalledWith('mark_stuck_tickets_as_failed')
  })

  it('returns error when RPC fails', async () => {
    const supabase = setupMock({
      rpcResults: { mark_stuck_tickets_as_failed: { data: null, error: { message: 'RPC error' } } },
    })

    const result = await markStuckTicketsAsFailed()
    expect(result.error).toBe('RPC error')
  })
})
