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

console.log('🖼️  Checking ticket images...\n')

// Get the specific ticket
const ticketId = '83d95a29-7d3e-4aaa-8925-cd343dcb60fa' // gemini 1 foto - mejorado 4

const { data: ticket, error } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  .single()

if (error || !ticket) {
  console.error('❌ Ticket not found:', error)
  process.exit(1)
}

console.log('📋 Ticket:', ticket.store_name)
console.log('   ID:', ticket.id)
console.log('   Status:', ticket.ocr_status)
console.log('   Total items:', ticket.total_items)
console.log('   Image path:', ticket.image_path)
console.log('   Image paths:', ticket.image_paths)
console.log('   OCR Error:', ticket.ocr_error)
console.log('   OCR Attempts:', ticket.ocr_attempts)
console.log('')

// Check if image exists in storage
const imagePaths = ticket.image_paths?.length > 0
  ? ticket.image_paths
  : ticket.image_path
    ? [ticket.image_path]
    : []

if (imagePaths.length === 0) {
  console.log('❌ No image paths found!')
  process.exit(1)
}

console.log(`🔍 Checking ${imagePaths.length} image(s) in storage...\n`)

for (const imagePath of imagePaths) {
  console.log(`   Checking: ${imagePath}`)

  // Try to create a signed URL
  const { data: signedUrlData, error: signedUrlError } = await supabase
    .storage
    .from('tickets')
    .createSignedUrl(imagePath, 60)

  if (signedUrlError) {
    console.log(`   ❌ Cannot create signed URL:`, signedUrlError.message)
  } else if (signedUrlData?.signedUrl) {
    console.log(`   ✅ Signed URL created successfully`)
    console.log(`   URL: ${signedUrlData.signedUrl.substring(0, 100)}...`)

    // Try to fetch the image
    try {
      const response = await fetch(signedUrlData.signedUrl)
      if (response.ok) {
        const blob = await response.blob()
        console.log(`   ✅ Image is accessible (${blob.size} bytes, ${blob.type})`)
      } else {
        console.log(`   ❌ Image fetch failed: ${response.status} ${response.statusText}`)
      }
    } catch (e) {
      console.log(`   ❌ Error fetching image:`, e.message)
    }
  } else {
    console.log(`   ❌ No signed URL returned`)
  }

  console.log('')
}

console.log('✅ Check complete')
