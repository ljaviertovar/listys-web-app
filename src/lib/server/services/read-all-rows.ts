/** What PostgREST answers per request by default; a longer result is cut silently, so a read of "everything" has to ask page by page. */
export const READ_PAGE_SIZE = 1000
/** Ids put in one `in (...)` filter: each id is in the URL, so a long list has to be split. */
export const READ_ID_CHUNK = 100

type Page<T> = { data: T[] | null; error: { code?: string } | null }

/** Reads every row of a query by asking for it a page at a time. The query must have a stable order, or pages can overlap. */
export async function readAllRows<T>(read: (start: number, end: number) => PromiseLike<Page<T>>): Promise<Page<T>> {
	const rows: T[] = []
	for (let start = 0; ; start += READ_PAGE_SIZE) {
		const { data, error } = await read(start, start + READ_PAGE_SIZE - 1)
		if (error) return { data: null, error }
		rows.push(...(data ?? []))
		if (!data || data.length < READ_PAGE_SIZE) return { data: rows, error: null }
	}
}

/** Reads every row that belongs to a long list of ids: the ids go in chunks, and each chunk is read in full. */
export async function readAllRowsForIds<T>(ids: ReadonlyArray<string>, read: (chunk: string[], start: number, end: number) => PromiseLike<Page<T>>): Promise<Page<T>> {
	const rows: T[] = []
	for (let index = 0; index < ids.length; index += READ_ID_CHUNK) {
		const chunk = ids.slice(index, index + READ_ID_CHUNK)
		const result = await readAllRows<T>((start, end) => read(chunk, start, end))
		if (result.error) return result
		rows.push(...(result.data ?? []))
	}
	return { data: rows, error: null }
}
