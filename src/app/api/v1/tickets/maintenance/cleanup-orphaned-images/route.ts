import { withApiHandler, success } from '@/lib/api/http'
import { cleanupOrphanedStorageImages } from '@/lib/server/services/tickets.service'

export async function POST() {
  return withApiHandler(async () => {
    const data = await cleanupOrphanedStorageImages()
    return success(data)
  })
}
