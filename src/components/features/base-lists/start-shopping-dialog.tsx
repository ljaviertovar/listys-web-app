'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon, ShoppingCart02Icon, Store01Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { SheetDialog } from '@/components/commons'
import { StorePickerDialog, type StorePick } from '@/components/features/stores'
import { createStore } from '@/lib/api/endpoints/stores'
import { startedSessionHref } from '@/components/features/shopping-sessions'
import { createShoppingSession } from '@/lib/api/endpoints'
import useActiveSessionStore from '@/stores/active-session'
import { cn } from '@/utils'
import type { BaseListItemWithStoreSummary, Store } from '@/types'

import { countItemsForStore, shoppingActionMode } from './items/helpers/store-session-summary'

/** The trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. `children` replaces the cart icon and "Start Shopping" label. */
interface Props extends ButtonProps {
	baseListId: string
	baseListName?: string
	itemsCount?: number
	items?: BaseListItemWithStoreSummary[]
	/** True only when this base list has an active session. */
	sessionActive?: boolean
	activeSessionId?: string | null
}

/**
 * "Start Shopping": the button and the sheet that confirms an optional store-scoped session.
 */
export function StartShoppingDialog({
	baseListId,
	baseListName,
	itemsCount,
	items = [],
	children,
	className,
	sessionActive = false,
	activeSessionId,
	...buttonProps
}: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [storePickerOpen, setStorePickerOpen] = useState(false)
	const [selectedStore, setSelectedStore] = useState<Store | null>(null)
	const [storePending, setStorePending] = useState(false)
	const storePendingRef = useRef(false)
	const loadingRef = useRef(false)
	const router = useRouter()
	const setActiveSession = useActiveSessionStore(s => s.setActiveSession)

	const handleConfirm = async () => {
		if (loadingRef.current) return
		loadingRef.current = true
		setLoading(true)
		try {
			const { data, error, activeSessionId } = await createShoppingSession({
				base_list_id: baseListId,
				name: baseListName || '',
				store_id: selectedStore?.id ?? null,
			})
			if (error) {
				if (activeSessionId) {
					router.push(`/shopping/${activeSessionId}`)
					return
				}
				throw new Error(error as string)
			}

			if (data?.id) {
				// Update store optimistically
				setActiveSession({ id: data.id, name: data.name })
				router.push(startedSessionHref(data.id))
				// Keep the sheet open with the spinner until navigation completes
			} else {
				router.refresh()
				setLoading(false)
				loadingRef.current = false
				setOpen(false)
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start shopping session')
			setLoading(false)
			loadingRef.current = false
			setOpen(false)
		}
	}

	const handleStorePick = async (pick: StorePick) => {
		if (storePendingRef.current) return
		storePendingRef.current = true
		setStorePending(true)
		try {
			if (pick.kind === 'existing') {
				setSelectedStore(pick.store)
			} else {
				const result = await createStore({ name: pick.name })
				if (result.error || !result.data) throw new Error(result.error ?? 'Could not create store')
				setSelectedStore(result.data)
			}
			setStorePickerOpen(false)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not select store')
		} finally {
			storePendingRef.current = false
			setStorePending(false)
		}
	}

	const firstAtStoreCount = selectedStore ? countItemsForStore(items, selectedStore.id) : 0

	const isEmpty = itemsCount !== undefined ? itemsCount === 0 : false

	if (shoppingActionMode(sessionActive) === 'resume') {
		return (
			<Button
				size='lg'
				{...buttonProps}
				className={cn('w-full', className)}
				onClick={() => activeSessionId && router.push(`/shopping/${activeSessionId}`)}
				aria-label={baseListName ? `Resume shopping ${baseListName}` : 'Resume shopping'}
				data-testid={`resume-shopping-${baseListId}`}
			>
				{children ?? 'Resume Shopping'}
			</Button>
		)
	}

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => !loading && setOpen(next)}
			trigger={
				<Button
					size='lg'
					{...buttonProps}
					disabled={buttonProps.disabled || isEmpty}
					className={cn('w-full', className)}
					// Several of these sit on one page, so the accessible name says which list each one starts.
					aria-label={baseListName ? `Start shopping ${baseListName}` : undefined}
			data-testid={`start-shopping-${baseListId}`}
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
				<div className='flex items-center justify-between gap-3 rounded-2xl bg-muted px-3.5 py-3'>
					<span className='flex min-w-0 items-center gap-2 text-sm text-foreground'>
						<HugeiconsIcon icon={Store01Icon} strokeWidth={1.6} aria-hidden='true' className='size-4.5 shrink-0' />
						<span className='truncate'>{selectedStore?.name ?? 'Whole list'}</span>
					</span>
					<Button type='button' size='sm' variant='secondary' onClick={() => setStorePickerOpen(true)} disabled={loading}>
						{selectedStore ? 'Change' : 'Choose Store'}
					</Button>
				</div>
				{selectedStore ? (
					<div role='note' className={`flex items-start gap-2 rounded-2xl px-3.5 py-3 text-sm leading-normal ${firstAtStoreCount === 0 ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200' : 'bg-muted text-muted-foreground'}`}>
						{firstAtStoreCount === 0 ? <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.6} aria-hidden='true' className='mt-px size-4.5 shrink-0' /> : null}
						<span>{firstAtStoreCount === 0 ? `No items in this list are tagged or recorded at ${selectedStore.name}.` : `${firstAtStoreCount} ${firstAtStoreCount === 1 ? 'item goes' : 'items go'} first at ${selectedStore.name}.`}</span>
					</div>
				) : null}
			</div>
			<DialogFooter variant='inline'>
				<Button
					size='primary'
					type='button'
					variant='secondary'
					className='flex-1'
					onClick={() => setOpen(false)}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					size='primary'
					type='button'
					className='flex-1'
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
			<StorePickerDialog
				open={storePickerOpen}
				onOpenChange={setStorePickerOpen}
				title='Choose Store'
				description='Items for this store will appear first.'
				confirmLabel='Use Store'
				onPick={handleStorePick}
				pending={storePending}
				testId={`start-shopping-store-picker-${baseListId}`}
			/>
		</SheetDialog>
	)
}
