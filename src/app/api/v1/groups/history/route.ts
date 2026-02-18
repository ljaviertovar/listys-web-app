import { withApiHandler, success } from '@/lib/api/http'
import { getGroupsWithHistory } from '@/lib/server/services/groups.service'

export async function GET() {
  return withApiHandler(async () => {
    const data = await getGroupsWithHistory()
    return success(data)
  })
}
