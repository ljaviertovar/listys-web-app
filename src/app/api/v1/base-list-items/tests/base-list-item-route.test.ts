import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiServiceError, ErrorCode } from '@/lib/api/http'

vi.mock('@/lib/server/services/base-lists.service', () => ({
  updateBaseListItem: vi.fn(),
  deleteBaseListItem: vi.fn(),
}))

import { PATCH } from '../[itemId]/route'
import { updateBaseListItem } from '@/lib/server/services/base-lists.service'

const mockedUpdate = vi.mocked(updateBaseListItem)
const ITEM_ID = '550e8400-e29b-41d4-a716-446655440000'
const STORE_ID = '6ba7b810-9dad-41d4-80b4-00c04fd430c8'

function patch(body: unknown) {
  return PATCH(new Request(`http://localhost/api/v1/base-list-items/${ITEM_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), { params: Promise.resolve({ itemId: ITEM_ID }) })
}

describe('PATCH /api/v1/base-list-items/{itemId} usual store contract', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets the usual store and returns the item summary', async () => {
    const item = { id: ITEM_ID, usual_store: { id: STORE_ID, name: 'Metro', source: 'manual' }, other_stores: [] }
    mockedUpdate.mockResolvedValueOnce(item as never)

    const response = await patch({ usual_store_id: STORE_ID })

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ data: item })
    expect(mockedUpdate).toHaveBeenCalledWith(ITEM_ID, { usual_store_id: STORE_ID })
  })

  it('clears the manual tag by sending null', async () => {
    mockedUpdate.mockResolvedValueOnce({ id: ITEM_ID, usual_store: null, other_stores: [] } as never)
    expect((await patch({ usual_store_id: null })).status).toBe(200)
  })

  it('returns not found for a foreign store or collaborator without exposing ownership', async () => {
    mockedUpdate.mockRejectedValueOnce(new ApiServiceError(404, ErrorCode.NOT_FOUND, 'Not found'))
    const response = await patch({ usual_store_id: STORE_ID })
    expect(response.status).toBe(404)
    expect((await response.json()).error.message).toBe('Not found')
  })

  it('rejects combined fields and malformed ids before the service call', async () => {
    expect((await patch({ usual_store_id: STORE_ID, notes: 'extra' })).status).toBe(422)
    expect((await patch({ usual_store_id: 'bad-id' })).status).toBe(422)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })
})
