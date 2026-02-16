#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

console.log('🔍 Debugging ticket items...\n')

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// Get ticket ID from command line
const ticketId = process.argv[2]

if (!ticketId) {
  console.error('Usage: node debug-ticket-items.mjs <ticket-id>')
  process.exit(1)
}

console.log(`Ticket ID: ${ticketId}\n`)

// 1. Get ticket info
console.log('📋 Ticket Info:')
const { data: ticket, error: ticketError } = await adminClient
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  .single()

if (ticketError) {
  console.error('Error fetching ticket:', ticketError)
  process.exit(1)
}

console.log('  - Store:', ticket.store_name)
console.log('  - User ID:', ticket.user_id)
console.log('  - Status:', ticket.ocr_status)
console.log('  - Total Items (field):', ticket.total_items)
console.log('')

// 2. Count items directly
console.log('🔢 Direct count from ticket_items:')
const { count, error: countError } = await adminClient
  .from('ticket_items')
  .select('*', { count: 'exact', head: true })
  .eq('ticket_id', ticketId)

if (countError) {
  console.error('Error counting items:', countError)
} else {
  console.log('  - Actual items in DB:', count)
}
console.log('')

// 3. Get all items
console.log('📦 Items in ticket_items table:')
const { data: items, error: itemsError } = await adminClient
  .from('ticket_items')
  .select('*')
  .eq('ticket_id', ticketId)

if (itemsError) {
  console.error('Error fetching items:', itemsError)
} else {
  console.log(`  Found ${items.length} items:`)
  items.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.name} (${item.quantity} ${item.unit}) - $${item.price}`)
  })
}
console.log('')

// 4. Test the join query (as admin)
console.log('🔗 Testing join query (admin):')
const { data: ticketWithItems, error: joinError } = await adminClient
  .from('tickets')
  .select(`
    *,
    items:ticket_items(*)
  `)
  .eq('id', ticketId)
  .single()

if (joinError) {
  console.error('Error with join:', joinError)
} else {
  console.log(`  Items via join: ${ticketWithItems.items?.length || 0}`)
}
console.log('')

// 5. Check RLS policies
console.log('🔐 Checking RLS:')
console.log('  RLS should allow user', ticket.user_id, 'to see items')
console.log('  Ticket owner should be able to SELECT from ticket_items')
console.log('')

console.log('✅ Diagnosis complete')
