interface UndoableHandlers {
	onUndo: () => void
	/** The notice went away, whichever way: its time ran out, it was dismissed or the person left the page. */
	onClose: () => void
}

interface UndoableOptions {
	/** Shows the notice with its Undo; it must call `onUndo` when Undo is pressed and `onClose` when it goes away. */
	show: (handlers: UndoableHandlers) => void
	run: () => Promise<{ error?: string | null } | void>
	onUndone: () => void
	onFailed: (message: string) => void
}

/**
 * An action that happens after an Undo window instead of right away, for things the database cannot bring back (deleting a
 * list, merging two stores). It runs at most once and never after Undo; `flush` runs it now, for when the person leaves.
 */
export function startUndoable({ show, run, onUndone, onFailed }: UndoableOptions): { flush: () => Promise<void> } {
	let state: 'waiting' | 'undone' | 'done' = 'waiting'

	const flush = async () => {
		if (state !== 'waiting') return
		state = 'done'
		const result = await run()
		const error = result ? result.error : null
		if (error) onFailed(error)
	}

	const undo = () => {
		if (state !== 'waiting') return
		state = 'undone'
		onUndone()
	}

	show({ onUndo: undo, onClose: () => void flush() })
	return { flush }
}
