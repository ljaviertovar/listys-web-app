import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ticketId = '83d95a29-7d3e-4aaa-8925-cd343dcb60fa'

console.log('🔍 Checking ticket:', ticketId)
console.log('')

// Get ticket
const { data: ticket } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  .single()

if (ticket) {
  console.log('📋 Ticket:', ticket.store_name)
  console.log('   Status:', ticket.ocr_status)
  console.log('   Total items field:', ticket.total_items)
  console.log('   OCR Error:', ticket.ocr_error)
  console.log('')
}

// Count items
const { count } = await supabase
  .from('ticket_items')
  .select('*', { count: 'exact', head: true })
  .eq('ticket_id', ticketId)

console.log('🔢 Actual items in DB:', count)
console.log('')

// Get all items
const { data: items } = await supabase
  .from('ticket_items')
  .select('*')
  .eq('ticket_id', ticketId)
  .limit(5)

if (items && items.length > 0) {
  console.log('📦 Sample items:')
  items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.name} - $${item.price} x ${item.quantity} ${item.unit}`)
  })
} else {
  console.log('❌ No items found')
}
