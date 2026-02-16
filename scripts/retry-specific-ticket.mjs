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

// The specific ticket to retry
const ticketId = '83d95a29-7d3e-4aaa-8925-cd343dcb60fa' // gemini 1 foto - mejorado 4

console.log('🔄 Retrying OCR for ticket:', ticketId)
console.log('')

// Get ticket
const { data: ticket, error: ticketError } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  .single()

if (ticketError || !ticket) {
  console.error('❌ Ticket not found:', ticketError)
  process.exit(1)
}

console.log('📋 Ticket:', ticket.store_name)
console.log('   Status:', ticket.ocr_status)
console.log('   Total items:', ticket.total_items)
console.log('')

// Get image paths
const imagePaths = ticket.image_paths?.length > 0
  ? ticket.image_paths
  : ticket.image_path
    ? [ticket.image_path]
    : []

if (imagePaths.length === 0) {
  console.error('❌ No image paths found')
  process.exit(1)
}

console.log(`📸 Found ${imagePaths.length} image(s)`)

// Delete existing items
const { error: deleteError } = await supabase
  .from('ticket_items')
  .delete()
  .eq('ticket_id', ticketId)

if (deleteError) {
  console.error('❌ Failed to delete old items:', deleteError)
} else {
  console.log('✅ Deleted old items')
}

// Reset ticket status
const { error: updateError } = await supabase
  .from('tickets')
  .update({
    ocr_status: 'pending',
    total_items: 0,
    processed_at: null,
    ocr_error: null
  })
  .eq('id', ticketId)

if (updateError) {
  console.error('❌ Failed to reset ticket:', updateError)
  process.exit(1)
}

console.log('✅ Reset ticket to pending')
console.log('')

// Generate signed URLs
console.log('🔗 Generating signed URLs...')
const signedUrls = []

for (const path of imagePaths) {
  const { data: signedUrlData, error: signedUrlError } = await supabase
    .storage
    .from('tickets')
    .createSignedUrl(path, 3600)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error(`   ❌ Failed for ${path}:`, signedUrlError?.message)
    continue
  }

  signedUrls.push(signedUrlData.signedUrl)
  console.log(`   ✅ Created signed URL for ${path}`)
}

if (signedUrls.length === 0) {
  console.error('❌ No signed URLs generated')
  process.exit(1)
}

console.log('')
console.log(`✅ Generated ${signedUrls.length} signed URL(s)`)
console.log('')

// Trigger OCR
const ocrUrl = process.env.NEXT_PUBLIC_OCR_FUNCTION_URL ||
  `${supabaseUrl}/functions/v1/process-ticket-ocr-gemini`

console.log('🚀 Triggering OCR at:', ocrUrl)
console.log('')

try {
  const response = await fetch(ocrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      ticketId,
      imageUrls: signedUrls,
      imageUrl: signedUrls[0]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ OCR failed:', response.status, errorText)
    process.exit(1)
  }

  const result = await response.json()
  console.log('✅ OCR triggered successfully')
  console.log('   Response:', result)
  console.log('')
  console.log('⏳ Wait a few seconds then check the ticket in your browser')
} catch (error) {
  console.error('❌ Error triggering OCR:', error.message)
  process.exit(1)
}
