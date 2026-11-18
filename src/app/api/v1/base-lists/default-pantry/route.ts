import { withApiHandler, success } from '@/lib/api/http'
import { setUpDefaultPantry } from '@/lib/server/services/default-pantry.service'

/** Gives the account a default list: the one it has, an existing "Pantry" marked as default, or a new "Pantry". */
export async function POST() {
  return withApiHandler(async () => {
    const { id, outcome } = await setUpDefaultPantry()
    return success({ id, outcome }, outcome === 'created' ? 201 : 200)
  })
}
