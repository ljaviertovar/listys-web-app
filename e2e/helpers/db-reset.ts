import { createTestClient } from './supabase-client'
import { loadE2EEnv } from './e2e-env'

/**
 * These helpers delete whole tables, which is only acceptable on a throwaway local database. They refuse anything that is not
 * a loopback Supabase named by the `E2E_SUPABASE_*` inputs, and they need an explicit opt-in on top. The suite is being moved
 * to fixtures that own and remove only their own rows (see openspec/changes/stabilize-test-foundation); until a spec is
 * migrated, this is the guard that keeps it away from the hosted project.
 */
function assertResetSafety() {
  // Throws unless every input is present and loopback: the application's own credentials are never consulted.
  loadE2EEnv()

  if (process.env.E2E_ALLOW_DB_RESET !== 'true') {
    throw new Error('Blocked destructive E2E reset. Set E2E_ALLOW_DB_RESET=true to allow test cleanup on a local database.')
  }
}

/**
 * Clean all test data from the database
 * Uses service role to bypass RLS
 */
export async function resetDatabase() {
  assertResetSafety()
  const supabase = createTestClient()

  // Delete in reverse dependency order
  await supabase.from('shopping_session_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shopping_session_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shopping_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('ticket_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('list_collaborators').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('list_invite_links').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('base_list_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('base_lists').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

/**
 * Clean test users from auth.users
 * Only deletes users created by tests (email starts with 'test-')
 */
export async function cleanTestUsers() {
  assertResetSafety()
  const supabase = createTestClient()

  // Note: Supabase Admin API would be better for this, but for now we'll rely on cascade deletes
  // When a user is deleted, all their data cascades via user_id foreign keys
  const { data: users } = await supabase.auth.admin.listUsers()

  if (!users) return

  const testUsers = users.users.filter(user => user.email?.startsWith('test-'))

  for (const user of testUsers) {
    await supabase.auth.admin.deleteUser(user.id)
  }
}

/**
 * Complete database reset including users
 */
export async function fullReset() {
  await resetDatabase()
  await cleanTestUsers()
}
