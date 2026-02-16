import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!url) {
  console.error('No NEXT_PUBLIC_SUPABASE_URL found')
  process.exit(1)
}

// Extract project ID from URL: https://fjhdpaorehlocayttgcb.supabase.co
const match = url.match(/https?:\/\/([^.]+)\./)
if (match) {
  console.log(match[1])
} else {
  console.error('Could not extract project ID from URL:', url)
  process.exit(1)
}
