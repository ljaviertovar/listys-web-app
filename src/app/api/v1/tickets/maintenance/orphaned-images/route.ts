import { withApiHandler, success } from '@/lib/api/http'
import { getOrphanedStorageImages } from '@/lib/server/services/tickets.service'

export async function GET() {
  return withApiHandler(async () => {
    const data = await getOrphanedStorageImages()
    return success(data)
  })
}
