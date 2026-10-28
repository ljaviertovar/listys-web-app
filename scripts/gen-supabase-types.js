#!/usr/bin/env node
function exit(msg) {
  console.error(msg)
  process.exit(1)
}

async function main() {
  const { execSync } = await import('node:child_process')
  const { existsSync, readFileSync, writeFileSync } = await import('node:fs')
  const path = await import('node:path')

// Try to load .env.local if present to populate env vars
const envPath = path.resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
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

if (!/^[a-z0-9-]+$/i.test(projectId)) {
  exit('Invalid Supabase project id. Pass the project id or a Supabase project URL.')
}

console.log('Generating Supabase types for project:', projectId)

try {
  const generatedTypes = execSync(`npx supabase gen types typescript --project-id ${projectId}`, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  })
  writeFileSync('src/types/database.types.ts', generatedTypes)
  console.log('Wrote src/types/database.types.ts')
} catch (err) {
  exit('Failed to generate types: ' + (err instanceof Error ? err.message : String(err)))
}
}

main().catch(error => exit('Failed to generate types: ' + (error instanceof Error ? error.message : String(error))))
