'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { startUndoable } from '@/utils/undoable-action'

const UNDO_WINDOW_MS = 6000

interface ScheduleOptions {
	/** What the notice says ("“Pantry” deleted"). */
	message: string
	run: () => Promise<{ error?: string | null } | void>
	onUndo?: () => void
	onFailure?: () => void
}

/**
 * Runs an action after a few seconds with an Undo, hiding what it affects meanwhile (`pending`). Leaving the page runs it at
 * once, so nothing is lost by closing the tab; a failure shows the error and brings the thing back.
 */
export function useUndoableAction() {
	const [pending, setPending] = useState(false)
	const flushRef = useRef<(() => Promise<void>) | null>(null)

	const schedule = useCallback(({ message, run, onUndo, onFailure }: ScheduleOptions) => {
		setPending(true)
		const { flush } = startUndoable({
			run: async () => {
				const result = await run()
				if (!result?.error) {
					flushRef.current = null
					setPending(false)
				}
				return result
			},
			onUndone: () => {
				flushRef.current = null
				onUndo?.()
				setPending(false)
			},
			onFailed: error => {
				toast.error(error)
				onFailure?.()
				setPending(false)
			},
			show: ({ onUndo, onClose }) => {
				toast.success(message, {
					duration: UNDO_WINDOW_MS,
					action: { label: 'Undo', onClick: onUndo },
					onAutoClose: onClose,
					onDismiss: onClose,
				})
			},
		})
		flushRef.current = flush
	}, [])

	useEffect(() => {
		const flushOnLeave = () => {
			void flushRef.current?.()
		}
		window.addEventListener('pagehide', flushOnLeave)
		return () => {
			window.removeEventListener('pagehide', flushOnLeave)
			flushOnLeave()
		}
	}, [])

	return { pending, schedule }
}
