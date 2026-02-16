import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Not set')
  process.exit(1)
}

// Use service role key to bypass RLS for debugging
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔍 Checking tickets with items...\n')

// Get all tickets
const { data: tickets, error: ticketsError } = await supabase
  .from('tickets')
  .select('id, store_name, total_items, ocr_status, created_at')
  .order('created_at', { ascending: false })
  .limit(10)

if (ticketsError) {
  console.error('❌ Error fetching tickets:', ticketsError)
  process.exit(1)
}

console.log(`Found ${tickets.length} recent tickets:\n`)

for (const ticket of tickets) {
  // Count items for this ticket
  const { count, error: countError } = await supabase
    .from('ticket_items')
    .select('*', { count: 'exact', head: true })
    .eq('ticket_id', ticket.id)

  const status = ticket.total_items === count ? '✅' : '❌'

  console.log(`${status} ${ticket.store_name || 'Unknown'}`)
  console.log(`   ID: ${ticket.id}`)
  console.log(`   Status: ${ticket.ocr_status}`)
  console.log(`   total_items field: ${ticket.total_items}`)
  console.log(`   actual items count: ${count}`)
  console.log('')
}

// Now try to fetch one with items using the join
console.log('\n🔗 Testing join query...\n')

const ticketWithItems = tickets.find(t => t.total_items > 0)

if (ticketWithItems) {
  console.log(`Fetching items for: ${ticketWithItems.store_name} (${ticketWithItems.id})`)

  // Try the join approach
  const { data: joined, error: joinError } = await supabase
    .from('tickets')
    .select(`
      *,
      items:ticket_items(*)
    `)
    .eq('id', ticketWithItems.id)
    .single()

  if (joinError) {
    console.error('❌ Join error:', joinError)
  } else {
    console.log(`✅ Join succeeded: ${joined.items?.length || 0} items returned`)
  }

  // Try separate queries
  const { data: separateItems, error: separateError } = await supabase
    .from('ticket_items')
    .select('*')
    .eq('ticket_id', ticketWithItems.id)

  if (separateError) {
    console.error('❌ Separate query error:', separateError)
  } else {
    console.log(`✅ Separate query: ${separateItems.length} items returned`)
  }
}

console.log('\n✅ Check complete')
