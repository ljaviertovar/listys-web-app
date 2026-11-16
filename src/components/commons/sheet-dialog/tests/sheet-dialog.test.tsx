import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'

const captured = vi.hoisted(() => ({
	escape: undefined as undefined | ((event: { target: unknown; preventDefault: () => void }) => void),
	onOpenChange: undefined as undefined | ((open: boolean) => void),
}))

vi.mock('@/components/ui/dialog', () => {
	const part = ({ children }: { children?: ReactNode }) => createElement('div', null, children)
	return {
		Dialog: ({ children, onOpenChange }: { children?: ReactNode; onOpenChange?: (open: boolean) => void }) => {
			captured.onOpenChange = onOpenChange
			return createElement('div', null, children)
		},
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
	captured.onOpenChange = undefined
})

it.each([true, false])('defers Escape to an expanded combobox only (expanded=%s)', expanded => {
	vi.stubGlobal('Element', FocusedControl)
	renderToStaticMarkup(<SheetDialog open title='Add item' testId='add-item-sheet'>Fields</SheetDialog>)
	const preventDefault = vi.fn()
	captured.escape?.({ target: new FocusedControl(expanded), preventDefault })
	expect(preventDefault).toHaveBeenCalledTimes(expanded ? 1 : 0)
})

it('renders no metadata group when the chips and facts slots are empty', () => {
	const html = renderToStaticMarkup(
		<SheetDialog open title='Add item' chips={[null, false]} facts={[undefined, false]} testId='add-item-sheet'>Fields</SheetDialog>,
	)
	expect(html).not.toContain('add-item-sheet-meta')
	expect(html).not.toContain('add-item-sheet-data')
})

it('renders the aside, chips and data line a sheet fills, skipping empty entries', () => {
	const html = renderToStaticMarkup(
		<SheetDialog
			open
			title='Receipt · 5 Nov'
			aside={<span>Failed</span>}
			chips={[<span key='store'>Store not confirmed</span>, null]}
			facts={[{ kind: 'count', value: 1, unit: 'photo' }, false, { kind: 'text', value: 'Uploaded 23:17' }]}
			testId='receipt-sheet'
		>
			Fields
		</SheetDialog>,
	)
	expect(html).toContain('Failed')
	expect(html).toContain('Store not confirmed')
	expect(html).toContain('data-testid="receipt-sheet-data"')
	expect(html).toContain('Uploaded 23:17')
})

it.each([
	{ busy: true, calls: 0 },
	{ busy: false, calls: 1 },
])('lets the sheet be dismissed only when it is not busy (busy=$busy)', ({ busy, calls }) => {
	const onOpenChange = vi.fn()
	renderToStaticMarkup(<SheetDialog open busy={busy} onOpenChange={onOpenChange} title='Upload Receipt' testId='upload-sheet'>Fields</SheetDialog>)
	captured.onOpenChange?.(false)
	expect(onOpenChange).toHaveBeenCalledTimes(calls)
})
