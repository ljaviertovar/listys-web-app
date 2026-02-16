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

console.log('🔄 Running stuck ticket cleanup...\n')

try {
  // Call the function to mark stuck tickets as failed
  const { data, error } = await supabase.rpc('mark_stuck_tickets_as_failed')

  if (error) {
    console.error('❌ Error running cleanup:', error)
    process.exit(1)
  }

  console.log('✅ Cleanup completed')
  console.log('')
  console.log('Check the database logs for details on updated tickets.')
  console.log('You can also run: SELECT * FROM tickets WHERE ocr_status = \'failed\' ORDER BY updated_at DESC LIMIT 10;')
} catch (err) {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
}
