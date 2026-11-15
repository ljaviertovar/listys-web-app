import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, expect, it, vi } from 'vitest'

const captured = vi.hoisted(() => ({
	change: undefined as undefined | ((open: boolean) => void),
	confirm: undefined as undefined | ((event: { preventDefault: () => void }) => void),
}))

vi.mock('@/components/ui/alert-dialog', async () => {
	const { createElement } = await import('react')
	const part = ({ children }: { children?: ReactNode }) => createElement('div', null, children)
	return {
		AlertDialog: ({ children, onOpenChange }: { children: ReactNode; onOpenChange: (open: boolean) => void }) => { captured.change = onOpenChange; return createElement('div', null, children) },
		AlertDialogContent: part,
		AlertDialogHeader: part,
		AlertDialogTitle: part,
		AlertDialogDescription: part,
		AlertDialogFooter: part,
		AlertDialogCancel: part,
		AlertDialogAction: ({ children, onClick }: { children: ReactNode; onClick: NonNullable<typeof captured.confirm> }) => { captured.confirm = onClick; return createElement('div', null, children) },
	}
})

import { ConfirmSheet } from '../confirm-sheet'

beforeEach(() => { captured.change = undefined; captured.confirm = undefined })

it('keeps the async confirmation open until the caller closes it', () => {
	const onConfirm = vi.fn()
	const onOpenChange = vi.fn()
	renderToStaticMarkup(createElement(ConfirmSheet, { open: true, title: 'Confirm action', confirmLabel: 'Confirm', testId: 'fixture-confirmation', onConfirm, onOpenChange }))
	const preventDefault = vi.fn()
	captured.confirm?.({ preventDefault })
	expect(preventDefault).toHaveBeenCalledOnce()
	expect(onConfirm).toHaveBeenCalledOnce()
	expect(onOpenChange).not.toHaveBeenCalled()
	captured.change?.(false)
	expect(onOpenChange).toHaveBeenCalledWith(false)
})

it('prevents dismissal and duplicate confirmation while the caller is saving', () => {
	const onConfirm = vi.fn()
	const onOpenChange = vi.fn()
	renderToStaticMarkup(createElement(ConfirmSheet, { open: true, loading: true, title: 'Confirm action', confirmLabel: 'Confirm', testId: 'fixture-confirmation', onConfirm, onOpenChange }))
	captured.confirm?.({ preventDefault: vi.fn() })
	captured.change?.(false)
	expect(onConfirm).not.toHaveBeenCalled()
	expect(onOpenChange).not.toHaveBeenCalled()
})
