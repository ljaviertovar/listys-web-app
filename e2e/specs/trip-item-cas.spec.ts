import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createCloseTheLoopFixture, createTestClient, loadE2EEnv } from '../helpers'
import type { Database } from '@/types'
import { MAX_ITEMS_PER_BASE_LIST } from '@/lib/config/limits'

async function clientFor(fixture: { email: string; password: string }) {
  const env = loadE2EEnv()
  const client = createClient<Database>(env.supabaseUrl, env.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const signedIn = await client.auth.signInWithPassword({ email: fixture.email, password: fixture.password })
  if (signedIn.error) throw new Error('Could not authenticate isolated local fixture')
  return client
}

test('atomic compare-and-set accepts only one of two effective edits with the same version', async () => {
  const fixture = await createCloseTheLoopFixture()
  try {
    const [first, second] = await Promise.all([clientFor(fixture), clientFor(fixture)])
    const itemResult = await first.from('shopping_session_items').select('id,version').eq('shopping_session_id', fixture.sessionId).eq('normalized_name', 'milk').single()
    if (!itemResult.data) throw new Error('Missing isolated fixture item')
    const item = itemResult.data
    const results = await Promise.all([first, second].map((client, index) => client.rpc('update_shopping_session_item_versioned', {
      p_item_id: item.id, p_expected_version: item.version, p_fields: { quantity: index + 2 },
    })))
    expect(results.every(result => !result.error)).toBe(true)
    expect(results.map(result => (result.data as { outcome: string }).outcome).sort()).toEqual(['conflict', 'updated'])
    const current = await first.from('shopping_session_items').select('version').eq('id', item.id).single()
    expect(current.data?.version).toBe(item.version + 1)
    const direct = await first.from('shopping_session_items').update({ checked: true }).eq('id', item.id)
    expect(direct.error?.code).toBe('42501')
  } finally { await fixture.cleanup() }
})

test('racing completion and check cannot write after the trip has completed', async () => {
  const fixture = await createCloseTheLoopFixture()
  try {
    const client = await clientFor(fixture)
    const item = await client.from('shopping_session_items').select('id,version').eq('shopping_session_id', fixture.sessionId).eq('normalized_name', 'milk').single()
    if (!item.data) throw new Error('Missing isolated fixture item')
    const [saved, completed] = await Promise.all([
      client.rpc('update_shopping_session_item_versioned', { p_item_id: item.data.id, p_expected_version: item.data.version, p_fields: { checked: true } }),
      client.rpc('complete_shopping_session', { p_session_id: fixture.sessionId }),
    ])
    expect(completed.error).toBeNull()
    expect(await fixture.getSessionStatus()).toBe('completed')
    const current = await client.from('shopping_session_items').select('checked,version').eq('id', item.data.id).single()
    if (saved.error) {
      expect(saved.error.message).toBe('SESSION_NOT_ACTIVE')
      expect(current.data?.checked).toBe(false)
    } else expect(current.data?.checked).toBe(true)
    const late = await client.rpc('update_shopping_session_item_versioned', { p_item_id: item.data.id,
      p_expected_version: current.data!.version, p_fields: { checked: false } })
    expect(late.error?.message).toBe('SESSION_NOT_ACTIVE')
  } finally { await fixture.cleanup() }
})

for (const sessionStatus of ['active', 'completed'] as const) {
  test(`receipt changes versioned items in a ${sessionStatus} trip under the final grants`, async () => {
    const fixture = await createCloseTheLoopFixture({ sessionStatus, receiptStore: 'Local Market' })
    try {
      const client = await clientFor(fixture)
      const read = () => client.from('shopping_session_items').select('version,price,checked').eq('shopping_session_id', fixture.sessionId).eq('normalized_name', 'milk').single()
      const before = await read()
      const priorLearning = await fixture.getItemState()
      const attached = await client.rpc('attach_receipt_to_session', { p_session_id: fixture.sessionId,
        p_ticket_id: fixture.ticketId, p_complete_session: false, p_total_amount: 17.25,
        p_links: [], p_added_item_ids: [], p_max_items: MAX_ITEMS_PER_BASE_LIST })
      expect(attached.error).toBeNull()
      const after = await read()
      expect(after.data?.version).toBeGreaterThan(before.data!.version)
      expect(after.data?.checked).toBe(true)
      expect(after.data?.price).toBe(4.25)
      expect(await fixture.getSessionStatus()).toBe(sessionStatus)
      const learned = await fixture.getItemState()
      expect(learned?.purchase_count).toBe(priorLearning?.purchase_count)
      const replay = await client.rpc('attach_receipt_to_session', { p_session_id: fixture.sessionId,
        p_ticket_id: fixture.ticketId, p_links: [], p_added_item_ids: [], p_total_amount: 17.25, p_max_items: MAX_ITEMS_PER_BASE_LIST })
      expect(replay.error).toBeNull()
      expect((await read()).data?.version).toBe(after.data?.version)
      expect(await fixture.getItemState()).toEqual(learned)
      // The setup client still has its service-only fixture privileges.
      expect((await createTestClient().from('shopping_session_items').select('id').eq('shopping_session_id', fixture.sessionId)).error).toBeNull()
    } finally { await fixture.cleanup() }
  })
}

test('the elevated receipt boundary denies foreign receipts and foreign base-list ownership', async () => {
  const own = await createCloseTheLoopFixture({ sessionStatus: 'completed', receiptStore: 'Owner Market' })
  const other = await createCloseTheLoopFixture({ sessionStatus: 'completed' })
  try {
    const client = await clientFor(own)
    const payload = { p_session_id: own.sessionId, p_links: [], p_added_item_ids: [],
      p_total_amount: 1, p_max_items: MAX_ITEMS_PER_BASE_LIST, p_complete_session: false }
    const foreignReceipt = await client.rpc('attach_receipt_to_session', { ...payload, p_ticket_id: other.ticketId })
    expect(foreignReceipt.error?.code).toBe('P0002')
    // An inconsistent row must not turn the elevated wrapper into a list-write bypass.
    const forged = await createTestClient().from('shopping_sessions').update({ base_list_id: other.baseListId }).eq('id', own.sessionId)
    expect(forged.error).toBeNull()
    const foreignList = await client.rpc('attach_receipt_to_session', { ...payload, p_ticket_id: own.ticketId })
    expect(foreignList.error?.code).toBe('P0002')
  } finally { await own.cleanup(); await other.cleanup() }
})
