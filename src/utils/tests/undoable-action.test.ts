import { describe, expect, it, vi } from 'vitest'

import { startUndoable } from '../undoable-action'

const setup = (result: { error?: string | null } | void = undefined) => {
	let handlers!: { onUndo: () => void; onClose: () => void }
	const run = vi.fn(async () => result)
	const onUndone = vi.fn()
	const onFailed = vi.fn()
	const action = startUndoable({ show: next => { handlers = next }, run, onUndone, onFailed })
	return { handlers, run, onUndone, onFailed, action }
}

describe('startUndoable', () => {
	it('does nothing until the notice goes away, then runs once', async () => {
		const { handlers, run } = setup()
		expect(run).not.toHaveBeenCalled()

		handlers.onClose()
		handlers.onClose()
		await Promise.resolve()

		expect(run).toHaveBeenCalledOnce()
	})

	it('never runs after Undo, even though pressing Undo also closes the notice', async () => {
		const { handlers, run, onUndone, action } = setup()

		handlers.onUndo()
		handlers.onClose()
		await action.flush()

		expect(onUndone).toHaveBeenCalledOnce()
		expect(run).not.toHaveBeenCalled()
	})

	it('runs right away when the person leaves before the notice closes', async () => {
		const { run, action } = setup()

		await action.flush()

		expect(run).toHaveBeenCalledOnce()
	})

	it('reports a failure so the caller can bring the thing back', async () => {
		const { handlers, onFailed } = setup({ error: 'Could not delete' })

		handlers.onClose()
		await vi.waitFor(() => expect(onFailed).toHaveBeenCalledWith('Could not delete'))
	})

	it('cannot be undone once it has run', async () => {
		const { handlers, onUndone, action } = setup()

		await action.flush()
		handlers.onUndo()

		expect(onUndone).not.toHaveBeenCalled()
	})
})
