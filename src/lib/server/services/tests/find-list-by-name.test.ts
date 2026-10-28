import { describe, it, expect } from 'vitest'

import { createQueryBuilder } from '@/test/helpers'
import { escapeLikePattern, findListByName, isSameListName } from '../find-list-by-name'

function clientWith(result: { data: unknown }) {
  const builder = createQueryBuilder(result)
  return { supabase: { from: () => builder } as never, builder }
}

describe('escapeLikePattern', () => {
  it('escapes the wildcard characters and the escape character so the match is literal', () => {
    expect(escapeLikePattern('50% off')).toBe('50\\% off')
    expect(escapeLikePattern('a_b')).toBe('a\\_b')
    expect(escapeLikePattern('back\\slash')).toBe('back\\\\slash')
    expect(escapeLikePattern('Weekly')).toBe('Weekly')
  })
})

describe('findListByName', () => {
  it('looks across the whole account: the user and the name, with no group filter', async () => {
    const { supabase, builder } = clientWith({ data: { id: 'other' } })

    await expect(findListByName(supabase, 'user-1', 'Weekly')).resolves.toEqual({ id: 'other' })
    expect(builder.eq.mock.calls).toEqual([['user_id', 'user-1']])
    expect(builder.ilike).toHaveBeenCalledWith('name', 'Weekly')
    expect(builder.neq).not.toHaveBeenCalled()
  })

  it('matches the name literally, so 50% off does not collide with 50 items', async () => {
    const { supabase, builder } = clientWith({ data: null })

    await findListByName(supabase, 'user-1', '50% off')

    expect(builder.ilike).toHaveBeenCalledWith('name', '50\\% off')
  })

  it('leaves the list being renamed out, and reads one row so legacy twins are still found', async () => {
    const { supabase, builder } = clientWith({ data: null })

    await findListByName(supabase, 'user-1', 'Weekly', 'list-1')

    expect(builder.neq).toHaveBeenCalledWith('id', 'list-1')
    expect(builder.limit).toHaveBeenCalledWith(1)
  })
})

describe('isSameListName', () => {
  it('ignores case only', () => {
    expect(isSameListName('Weekly', 'weekly')).toBe(true)
    expect(isSameListName('Weekly', 'Weekly 2')).toBe(false)
  })
})
