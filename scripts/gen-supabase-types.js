#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function exit(msg) {
  console.error(msg)
  process.exit(1)
}

// Try to load .env.local if present to populate env vars
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith("\'") && val.endsWith("\'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

// Accept either a project id as first arg, or read NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL from env
let projectId = process.argv[2] || process.env.SUPABASE_PROJECT_ID || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
if (!projectId) exit('No Supabase project id or URL provided. Pass as arg or set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_ID in env')

// If URL provided, extract subdomain/project id from *.supabase.co
if (projectId.includes('supabase.co')) {
  const m = projectId.match(/^https?:\/\/([^.]*)\.supabase\.co/)
  if (m && m[1]) projectId = m[1]
}

console.log('Generating Supabase types for project:', projectId)

try {
  execSync(`npx supabase gen types typescript --project-id ${projectId} > src/lib/supabase/database.types.ts`, { stdio: 'inherit' })
  console.log('Wrote src/lib/supabase/database.types.ts')
} catch (err) {
  exit('Failed to generate types: ' + err.message)
}
