import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'

const captured = vi.hoisted(() => ({
	escape: undefined as undefined | ((event: { target: unknown; preventDefault: () => void }) => void),
}))

vi.mock('@/components/ui/dialog', () => {
	const part = ({ children }: { children?: ReactNode }) => createElement('div', null, children)
	return {
		Dialog: part,
		DialogClose: part,
		DialogDescription: part,
		DialogHeader: part,
		DialogTitle: part,
		DialogTrigger: part,
		DialogContent: ({ children, onEscapeKeyDown }: { children?: ReactNode; onEscapeKeyDown: typeof captured.escape }) => {
			captured.escape = onEscapeKeyDown
			return createElement('div', null, children)
		},
	}
})

import { SheetDialog } from '../sheet-dialog'

class FocusedControl {
	constructor(private readonly expanded: boolean) {}
	closest() { return this.expanded ? this : null }
}

afterEach(() => {
	vi.unstubAllGlobals()
	captured.escape = undefined
})

it.each([true, false])('defers Escape to an expanded combobox only (expanded=%s)', expanded => {
	vi.stubGlobal('Element', FocusedControl)
	renderToStaticMarkup(<SheetDialog open title='Add item' testId='add-item-sheet'>Fields</SheetDialog>)
	const preventDefault = vi.fn()
	captured.escape?.({ target: new FocusedControl(expanded), preventDefault })
	expect(preventDefault).toHaveBeenCalledTimes(expanded ? 1 : 0)
})
