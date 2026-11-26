import { createStore } from 'zustand/vanilla'

import type { SetBaseListItemsNeededInput } from '@/lib/validations/base-list'

/** Taps are collected until this long passes without one; `maxWaitMs` keeps endless tapping from putting the save off. */
export const NEEDED_AUTOSAVE = { debounceMs: 1500, maxWaitMs: 10_000, retryMaxMs: 30_000, echoMs: 10_000 } as const

/** A check made on this device. Once `saved`, it covers the page data until a read agrees with it. */
export type NeededEntry = {
	needed: boolean
	sequence: number
	saved: boolean
	/** The first read that disagreed with the saved value. */
	disputedBy?: object
}
export type NeededSyncState = {
	entries: Record<string, NeededEntry>
	/** The last send failed and will be retried. */
	failing: boolean
	/** Moves each time the server refuses checks, so the screen knows to read what it does have. */
	rejectedCount: number
}

export type NeededSyncTransport = {
	save: (data: SetBaseListItemsNeededInput) => Promise<{ error?: string; status?: number }>
	/** The server refused the checks; retrying would not change the answer. */
	onRejected: (message: string) => void
}

const SAVE_ERROR = 'Your checks are not saved yet. Try again.'

/** A request timeout or a rate limit passes; any other 4xx is the server's final answer. */
const isRejection = (status?: number) => status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429

export function applyNeededEntries<T extends { id: string; needed_at: string | null }>(items: T[], entries: Record<string, NeededEntry>): T[] {
	return items.map(item => {
		const entry = entries[item.id]
		if (!entry || entry.needed === Boolean(item.needed_at)) return item
		// Stands in for the date until the server sends the real one. Only its presence is ever read.
		return { ...item, needed_at: entry.needed ? new Date(0).toISOString() : null }
	})
}

/** Saves the checks of one base list in the background. It outlives the screen, and sends one request at a time. */
export function createNeededSyncController(transport: NeededSyncTransport) {
	const store = createStore<NeededSyncState>(() => ({ entries: {}, failing: false, rejectedCount: 0 }))
	/** What this tab sent lately, to recognise the realtime events it causes itself. */
	const sentValues = new Map<string, { needed: boolean; at: number }>()
	let sequence = 0
	let timer: ReturnType<typeof setTimeout> | undefined
	let firstChangeAt: number | undefined
	let failures = 0
	let retryAt = 0
	let inFlight: Promise<void> | undefined

	const unsaved = () => Object.entries(store.getState().entries).filter(([, entry]) => !entry.saved)

	function schedule() {
		clearTimeout(timer)
		if (inFlight || !unsaved().length) return
		const now = Date.now()
		firstChangeAt ??= now
		const wait = retryAt > now ? retryAt - now : Math.max(0, Math.min(NEEDED_AUTOSAVE.debounceMs, firstChangeAt + NEEDED_AUTOSAVE.maxWaitMs - now))
		timer = setTimeout(() => { void send().catch(() => {}) }, wait)
	}

	function queue(ids: string[], needed: boolean) {
		sequence++
		store.setState(state => {
			const entries = { ...state.entries }
			for (const id of ids) entries[id] = { needed, sequence, saved: false }
			return { entries }
		})
		firstChangeAt ??= Date.now()
		schedule()
	}

	/** One request carries every unsaved check, ticked and unticked alike, each with its latest value. */
	function send(): Promise<void> {
		if (inFlight) return inFlight
		clearTimeout(timer)
		const sent = unsaved()
		if (!sent.length) return Promise.resolve()

		/** Changes only the checks that were not tapped again while the request was on its way. */
		const settle = (change: (entries: NeededSyncState['entries'], id: string) => void) => {
			store.setState(state => {
				const entries = { ...state.entries }
				for (const [id, entry] of sent) if (entries[id]?.sequence === entry.sequence) change(entries, id)
				return { entries, failing: false }
			})
			failures = 0
			retryAt = 0
		}

		const remember = () => { for (const [id, entry] of sent) sentValues.set(id, { needed: entry.needed, at: Date.now() }) }
		remember()
		inFlight = Promise.resolve()
			.then(() => transport.save({ changes: sent.map(([id, entry]) => ({ item_id: id, needed: entry.needed })) }))
			.catch((): { error: string; status?: number } => ({ error: SAVE_ERROR }))
			.then(result => {
				if (!result.error) {
					remember()
					settle((entries, id) => { entries[id] = { ...entries[id], saved: true } })
					return
				}
				if (isRejection(result.status)) {
					for (const [id] of sent) sentValues.delete(id)
					settle((entries, id) => { delete entries[id] })
					store.setState(state => ({ rejectedCount: state.rejectedCount + 1 }))
					transport.onRejected(result.error)
				} else {
					retryAt = Date.now() + Math.min(1000 * 2 ** Math.min(failures++, 5), NEEDED_AUTOSAVE.retryMaxMs)
					store.setState({ failing: true })
				}
				throw new Error(result.error)
			})
			.finally(() => {
				inFlight = undefined
				firstChangeAt = undefined
				schedule()
			})
		return inFlight
	}

	/** Sends what is waiting right away. Resolves once the server has every check, and throws if it does not. */
	async function flush() {
		if (inFlight) await inFlight
		while (unsaved().length) {
			retryAt = 0
			await send()
		}
	}

	/**
	 * Page data reached the screen. A saved check stops covering it once they agree. Data that disagrees may be older
	 * than the save, so it is asked to be read again, once; if a second read still disagrees, the change was made
	 * somewhere else and it wins. Returns true when the page has to be read again.
	 */
	function release(items: Array<{ id: string; needed_at: string | null }>): boolean {
		const serverValues = new Map(items.map(item => [item.id, Boolean(item.needed_at)]))
		const current = Object.entries(store.getState().entries)
		const kept: NeededSyncState['entries'] = {}
		let readAgain = false
		for (const [id, entry] of current) {
			if (!entry.saved) kept[id] = entry
			else if (!serverValues.has(id) || serverValues.get(id) === entry.needed) continue
			else if (!entry.disputedBy) {
				kept[id] = { ...entry, disputedBy: items }
				readAgain = true
			} else if (entry.disputedBy === items) kept[id] = entry
		}
		if (readAgain || Object.keys(kept).length !== current.length) store.setState({ entries: kept })
		return readAgain
	}

	/** True when a changed row only repeats what this tab just sent, so there is nothing new to read. */
	function isEcho(row: { id?: string; needed_at?: string | null }): boolean {
		const sent = row.id ? sentValues.get(row.id) : undefined
		return Boolean(sent) && sent!.needed === Boolean(row.needed_at) && Date.now() - sent!.at < NEEDED_AUTOSAVE.echoMs
	}

	return { store, queue, flush, release, isEcho }
}

export type NeededSyncController = ReturnType<typeof createNeededSyncController>
