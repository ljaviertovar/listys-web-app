import { useCallback, useRef, type RefObject } from 'react'

interface Options {
	autoFocus?: boolean
}

export function useDialogFocus(initialFocusRef?: RefObject<HTMLElement | null>, { autoFocus = false }: Options = {}) {
	const returnFocusRef = useRef<HTMLElement | null>(null)

	const onOpenAutoFocus = useCallback((event: Event) => {
		const activeElement = document.activeElement
		returnFocusRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
			? activeElement
			: null

		if (!autoFocus && initialFocusRef?.current) {
			event.preventDefault()
			initialFocusRef.current.focus()
		}
	}, [autoFocus, initialFocusRef])

	const onCloseAutoFocus = useCallback((event: Event) => {
		const target = returnFocusRef.current
		returnFocusRef.current = null

		if (target?.isConnected) {
			event.preventDefault()
			target.focus()
		}
	}, [])

	return { onOpenAutoFocus, onCloseAutoFocus }
}
