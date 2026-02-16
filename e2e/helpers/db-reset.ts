import { createTestClient } from './supabase-client'

/**
 * Clean all test data from the database
 * Uses service role to bypass RLS
 */
export async function resetDatabase() {
  const supabase = createTestClient()

  // Delete in reverse dependency order
  await supabase.from('shopping_session_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('shopping_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('ticket_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('base_list_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('base_lists').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

/**
 * Clean test users from auth.users
 * Only deletes users created by tests (email starts with 'test-')
 */
export async function cleanTestUsers() {
  const supabase = createTestClient()

  // Note: Supabase Admin API would be better for this, but for now we'll rely on cascade deletes
  // When a user is deleted, all their data cascades via user_id foreign keys
  const { data: users } = await supabase.auth.admin.listUsers()

  if (!users) return

  const testUsers = users.users.filter((u: any) => u.email?.startsWith('test-'))

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
