import { describe, expect, it, vi } from 'vitest'

import { READ_ID_CHUNK, READ_PAGE_SIZE, readAllRows, readAllRowsForIds } from '../read-all-rows'

const rows = (count: number, offset = 0) => Array.from({ length: count }, (_, index) => ({ n: offset + index }))

describe('readAllRows', () => {
	it('keeps asking until a page comes back short, so nothing past the first page is lost', async () => {
		const read = vi.fn(async (...range: [number, number]) => ({ data: range[0] === 0 ? rows(READ_PAGE_SIZE) : rows(3, READ_PAGE_SIZE), error: null }))
		const result = await readAllRows(read)
		expect(result.data).toHaveLength(READ_PAGE_SIZE + 3)
		expect(read.mock.calls.map(([start, end]) => [start, end])).toEqual([[0, READ_PAGE_SIZE - 1], [READ_PAGE_SIZE, 2 * READ_PAGE_SIZE - 1]])
	})

	it('asks once when the first page already holds everything', async () => {
		const read = vi.fn(async () => ({ data: rows(5), error: null }))
		await readAllRows(read)
		expect(read).toHaveBeenCalledTimes(1)
	})

	it('stops at the first error and returns it', async () => {
		const read = vi.fn(async () => ({ data: null, error: { code: 'XX000' } }))
		expect(await readAllRows(read)).toEqual({ data: null, error: { code: 'XX000' } })
	})
})

describe('readAllRowsForIds', () => {
	it('splits a long list of ids so no filter holds more than a chunk', async () => {
		const ids = Array.from({ length: READ_ID_CHUNK * 2 + 1 }, (_, index) => `id-${index}`)
		const read = vi.fn(async (chunk: string[]) => ({ data: chunk.map(id => ({ id })), error: null }))
		const result = await readAllRowsForIds(ids, read)
		expect(read.mock.calls.map(([chunk]) => chunk.length)).toEqual([READ_ID_CHUNK, READ_ID_CHUNK, 1])
		expect(result.data).toHaveLength(ids.length)
	})

	it('reads nothing for no ids', async () => {
		const read = vi.fn()
		expect(await readAllRowsForIds([], read)).toEqual({ data: [], error: null })
		expect(read).not.toHaveBeenCalled()
	})
})
