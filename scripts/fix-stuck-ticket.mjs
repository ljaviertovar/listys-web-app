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

const ticketId = '855ee692-7c67-46b4-9556-02a69f62e458'

console.log('🔍 Checking stuck ticket:', ticketId)
console.log('')

const { data: ticket } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  .single()

if (ticket) {
  console.log('📋 Ticket:', ticket.store_name || 'Unknown')
  console.log('   Status:', ticket.ocr_status)
  console.log('   OCR Attempts:', ticket.ocr_attempts)
  console.log('   Created at:', new Date(ticket.created_at).toLocaleString())
  console.log('   Processed at:', ticket.processed_at ? new Date(ticket.processed_at).toLocaleString() : 'null')

  // Calculate time stuck
  const now = new Date()
  const createdAt = new Date(ticket.created_at)
  const minutesStuck = Math.floor((now - createdAt) / 1000 / 60)

  console.log('   Time stuck:', minutesStuck, 'minutes')
  console.log('')

  if (ticket.ocr_status === 'processing') {
    console.log('❌ Ticket is stuck in processing state')
    console.log('')
    console.log('Marking as failed...')

    const { error } = await supabase
      .from('tickets')
      .update({
        ocr_status: 'failed',
        ocr_error: `OCR processing timed out after ${minutesStuck} minutes. The process may have crashed or taken too long.`
      })
      .eq('id', ticketId)

    if (error) {
      console.error('❌ Failed to update:', error)
    } else {
      console.log('✅ Ticket marked as failed')
    }
  }
}
