import { config } from 'dotenv'
import { resolve } from 'path'

import { resetDemoUserData } from './demo-user-utils.mjs'

config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const result = await resetDemoUserData()

  console.log('✅ Demo user reset successfully')
  console.log(`   Email: ${result.email}`)
  console.log(`   User ID: ${result.userId}`)
  console.log(`   Groups: ${result.groupCount}`)
  console.log(`   Base lists: ${result.baseListCount}`)
  console.log(`   Tickets: ${result.ticketCount}`)
  console.log(`   Completed sessions: ${result.completedSessionCount}`)
  console.log(`   Active sessions: ${result.activeSessionCount}`)
}

main().catch(error => {
  console.error('❌ Failed to reset demo user:', error.message)
  process.exit(1)
})
