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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔄 Finding tickets to reprocess...\n')

// Find tickets with total_items > 0 but no actual items
const { data: tickets, error } = await supabase
  .from('tickets')
  .select('id, store_name, total_items, ocr_status, user_id, image_path, created_at')
  .gt('total_items', 0)
  .eq('ocr_status', 'completed')
  .order('created_at', { ascending: false })

if (error) {
  console.error('❌ Error fetching tickets:', error)
  process.exit(1)
}

console.log(`Found ${tickets.length} completed tickets with total_items > 0\n`)

const ticketsToReprocess = []

for (const ticket of tickets) {
  // Check actual item count
  const { count } = await supabase
    .from('ticket_items')
    .select('*', { count: 'exact', head: true })
    .eq('ticket_id', ticket.id)

  if (count === 0) {
    console.log(`❌ ${ticket.store_name || 'Unknown'}`)
    console.log(`   ID: ${ticket.id}`)
    console.log(`   Expected: ${ticket.total_items} items, Found: 0 items`)
    console.log(`   Created: ${new Date(ticket.created_at).toLocaleString()}`)
    console.log('')
    ticketsToReprocess.push(ticket)
  }
}

if (ticketsToReprocess.length === 0) {
  console.log('✅ No tickets need reprocessing!')
  process.exit(0)
}

console.log(`\n📋 Summary: ${ticketsToReprocess.length} tickets need reprocessing\n`)
console.log('To reprocess these tickets, reset them to pending:')
console.log('')
console.log('const ticketIds = [')
ticketsToReprocess.forEach(t => {
  console.log(`  '${t.id}', // ${t.store_name || 'Unknown'}`)
})
console.log(']')
console.log('')

// Ask if user wants to reset them
console.log('Do you want to reset these tickets to pending status?')
console.log('This will trigger OCR reprocessing when you upload them again.')
console.log('')
console.log('Run with --reset flag to reset them automatically:')
console.log('  node scripts/reprocess-tickets.mjs --reset')

if (process.argv.includes('--reset')) {
  console.log('\n🔄 Resetting tickets to pending...\n')

  for (const ticket of ticketsToReprocess) {
    const { error: resetError } = await supabase
      .from('tickets')
      .update({
        ocr_status: 'pending',
        processed_at: null,
        total_items: 0,
        ocr_error: null
      })
      .eq('id', ticket.id)

    if (resetError) {
      console.error(`❌ Failed to reset ${ticket.store_name}:`, resetError)
    } else {
      console.log(`✅ Reset ${ticket.store_name}`)

      // Trigger OCR processing
      const ocrUrl = process.env.NEXT_PUBLIC_OCR_FUNCTION_URL ||
        `${supabaseUrl}/functions/v1/process-ticket-ocr-gemini`

      try {
        // Check if ticket has multiple images
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('image_path, image_paths')
          .eq('id', ticket.id)
          .single()

        const imagePaths = ticketData.image_paths?.length > 0
          ? ticketData.image_paths
          : [ticketData.image_path]

        // Generate signed URLs for each image
        const signedUrls = []
        for (const path of imagePaths) {
          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('tickets')
            .createSignedUrl(path, 3600)

          if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error(`   Warning: Failed to create signed URL for ${path}`)
            continue
          }

          signedUrls.push(signedUrlData.signedUrl)
        }

        if (signedUrls.length === 0) {
          console.error(`   ❌ Failed to generate signed URLs`)
          continue
        }

        const response = await fetch(ocrUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            ticketId: ticket.id,
            imageUrls: signedUrls,
            imageUrl: signedUrls[0]
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`   ❌ OCR failed (${response.status}):`, errorText)
        } else {
          console.log(`   ✅ OCR triggered`)
        }
      } catch (error) {
        console.error(`   Warning: Failed to trigger OCR:`, error.message)
      }
    }
  }

  console.log('\n✅ Reprocessing complete!')
}
