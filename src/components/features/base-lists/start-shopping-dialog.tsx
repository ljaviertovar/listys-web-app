'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { InformationCircleIcon, Loading03Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { SheetDialog } from '@/components/commons'
import { createShoppingSession } from '@/lib/api/endpoints'
import useActiveSessionStore from '@/stores/active-session'
import { cn } from '@/utils'

/** The trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. `children` replaces the cart icon and "Start Shopping" label. */
interface Props extends ButtonProps {
	baseListId: string
	baseListName?: string
	itemsCount?: number
	/** The server already knows a session is running, so the button is not even drawn before the client store loads. */
	sessionActive?: boolean
}

/**
 * "Start Shopping": the button and the sheet that confirms it. Only one shopping session can run at a time, so the
 * button is gone while one is active (the session bar and the dashboard lead back to it).
 */
export function StartShoppingDialog({
	baseListId,
	baseListName,
	itemsCount,
	children,
	className,
	sessionActive = false,
	...buttonProps
}: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const activeSession = useActiveSessionStore(s => s.activeSession)
	const setActiveSession = useActiveSessionStore(s => s.setActiveSession)

	const handleConfirm = async () => {
		setLoading(true)
		try {
			const { data, error, activeSessionId } = await createShoppingSession({
				base_list_id: baseListId,
				name: baseListName || '',
			})
			if (error) {
				// If there's an active session, navigate to it
				if ((error as string).includes('active shopping run') && activeSessionId) {
					router.push(`/shopping/${activeSessionId}`)
					return
				}
				throw new Error(error as string)
			}

			if (data?.id) {
				// Update store optimistically
				setActiveSession({ id: data.id, name: data.name })
				router.push(`/shopping/${data.id}`)
				// Keep the sheet open with the spinner until navigation completes
			} else {
				router.refresh()
				setLoading(false)
				setOpen(false)
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start shopping session')
			setLoading(false)
			setOpen(false)
		}
	}

	const isEmpty = itemsCount !== undefined ? itemsCount === 0 : false

	// While the session is being created the store already holds it; the sheet stays until the page changes.
	if ((sessionActive || activeSession) && !loading) return null

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !loading && setOpen(next)}
			trigger={
				<Button
					size='primary'
					{...buttonProps}
					disabled={buttonProps.disabled || isEmpty}
					className={cn('w-full', className)}
					// Several of these sit on one page, so the accessible name says which list each one starts.
					aria-label={baseListName ? `Start shopping ${baseListName}` : undefined}
					data-testid='start-shopping-button'
				>
					{children ?? (
						<>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={1.5}
								data-icon='inline-start'
							/>
							Start Shopping
						</>
					)}
				</Button>
			}
			title='Start Shopping Session'
			testId='start-shopping-sheet'
		>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center gap-3.5'>
					<span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={1.5}
							aria-hidden='true'
							className='size-6'
						/>
					</span>
					<p className='text-sm leading-normal text-slate-600 dark:text-muted-foreground'>
						{isEmpty ? (
							'This base list has no items. Add items before starting a shopping session.'
						) : (
							<>
								This will create a new shopping session using the items of
								{baseListName ? ` “${baseListName}”` : ' this base list'}.
							</>
						)}
					</p>
				</div>
				<div
					role='note'
					className='flex items-start gap-3 rounded-2xl bg-blue-50 px-3.5 py-3 text-sm leading-normal text-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
				>
					<HugeiconsIcon
						icon={InformationCircleIcon}
						strokeWidth={1.6}
						aria-hidden='true'
						className='mt-px size-5 shrink-0'
					/>
					<span>Only one shopping session can be active at a time.</span>
				</div>
			</div>
			<DialogFooter variant='sheet'>
				<Button
					size='primary'
					type='button'
					variant='secondary'
					onClick={() => setOpen(false)}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					size='primary'
					type='button'
					onClick={handleConfirm}
					disabled={loading || isEmpty}
					data-testid='confirm-start-shopping'
				>
					<HugeiconsIcon
						icon={loading ? Loading03Icon : ShoppingCart02Icon}
						strokeWidth={loading ? 2 : 1.5}
						aria-hidden='true'
						className={cn('size-4.5', loading && 'animate-spin motion-reduce:animate-none')}
					/>
					{loading ? 'Starting…' : 'Start Shopping'}
				</Button>
			</DialogFooter>
		</SheetDialog>
	)
}
