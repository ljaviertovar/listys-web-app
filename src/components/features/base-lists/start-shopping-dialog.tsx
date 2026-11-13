'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading03Icon, ListViewIcon, ShoppingCart02Icon, Store03Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DialogFooter } from '@/components/ui/dialog'
import { RowIcon, SheetDialog } from '@/components/commons'
import { StorePickerDialog, type StorePick } from '@/components/features/stores'
import { createStore } from '@/lib/api/endpoints/stores'
import { buildSessionPriceEstimate, startedSessionHref } from '@/components/features/shopping-sessions'
import { createShoppingSession } from '@/lib/api/endpoints'
import useActiveSessionStore from '@/stores/active-session'
import { cn, formatCurrency } from '@/utils'
import type { BaseListItemWithStoreSummary, Store } from '@/types'

import { itemsForStore, shoppingActionMode, summarizeItemsByStore } from './items/helpers/store-session-summary'

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
				name: baseListName ? `${baseListName} trip` : 'Shopping trip',
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
				setActiveSession({ id: data.id, name: data.name, store_id: data.store_id })
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

	const { counts: storeItemCounts, unassignedCount } = summarizeItemsByStore(items)
	const listItemCount = itemsCount ?? items.length
	const selectedItems = selectedStore
		? itemsForStore(items, selectedStore.id)
		: items
	const firstAtStoreCount = selectedItems.length

	const isEmpty = itemsCount !== undefined ? itemsCount === 0 : false
	// The trip copies these items, so the list's own averages are what it would cost; nothing is shown without a known price.
	const estimate = buildSessionPriceEstimate(selectedItems, items)

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
		<>
		<SheetDialog
			open={open && !storePickerOpen}
			onOpenChange={next => !storePickerOpen && !loading && setOpen(next)}
			trigger={
				<Button
					size='lg'
					{...buttonProps}
					disabled={buttonProps.disabled}
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
			title='Start Shopping?'
			testId='start-shopping-sheet'
		>
			<div className='flex flex-col gap-4'>
				<div data-testid='start-shopping-list-summary' className='flex flex-col gap-3 rounded-2xl bg-muted px-3.5 py-3'>
					<div className='flex items-center gap-3'>
						<RowIcon icon={ListViewIcon} tone='primary' size='dropzone' testId='start-shopping-list-icon' />
						<div className='flex min-w-0 flex-col gap-0.5'>
							<span className='text-sm font-semibold text-foreground'>{baseListName || 'Shopping list'}</span>
							<span className='text-xs leading-normal text-muted-foreground'>{listItemCount} {listItemCount === 1 ? 'item' : 'items'} in this list</span>
						</div>
					</div>
					{!isEmpty ? <div data-testid='start-shopping-estimate' className='flex items-end justify-between gap-3 border-t border-border pt-3'>
						<div className='flex min-w-0 flex-col gap-1'>
							<span className='text-xs leading-[1.3] text-muted-foreground'>Estimated total</span>
							<span className='text-xs leading-normal text-muted-foreground'>From {estimate.pricedCount} of {estimate.itemCount} {estimate.itemCount === 1 ? 'item' : 'items'}</span>
						</div>
						{estimate.pricedCount > 0 ? <span className='font-mono text-lg leading-none font-semibold text-foreground tabular-nums'>≈ {formatCurrency(estimate.total)}</span> : <span className='text-xs text-muted-foreground'>No known prices</span>}
					</div> : null}
				</div>
				{isEmpty ? <p className='text-sm leading-normal text-body dark:text-muted-foreground'>This base list has no items. Add items before starting a shopping session.</p> : null}
				<div className='flex items-center justify-between gap-3 rounded-2xl bg-muted px-3.5 py-3'>
					<span className='flex min-w-0 items-center gap-3'>
						<RowIcon icon={selectedStore ? Store03Icon : ListViewIcon} tone={selectedStore ? 'store' : 'primary'} size='md' testId='start-shopping-scope-icon' />
						<span className='flex min-w-0 flex-col gap-0.5'>
							<span className='truncate text-sm font-semibold text-foreground'>{selectedStore?.name ?? 'Whole list'}</span>
							<span className='text-xs leading-normal text-muted-foreground'>{selectedStore ? `${firstAtStoreCount} of ${listItemCount} items` : `All stores · ${listItemCount} items`}</span>
						</span>
					</span>
					<Button type='button' size='sm' variant='outline' onClick={() => setStorePickerOpen(true)} disabled={loading}>
						{selectedStore ? 'Change' : 'Choose Store'}
					</Button>
				</div>
				{!isEmpty ? <Alert variant='receipt-info' role='note' data-testid='start-shopping-guidance'>
					<RowIcon icon={Alert02Icon} tone='primary' size='alert' testId='start-shopping-guidance-icon' />
					<div>
						<AlertTitle>{selectedStore ? `Only ${selectedStore.name} items` : 'One trip at a time per list.'}</AlertTitle>
						<AlertDescription>{selectedStore
							? `This starts a new shopping session with ${firstAtStoreCount === 1 ? 'the 1 item' : `the ${firstAtStoreCount} items`} in “${baseListName || 'this list'}” you usually buy at ${selectedStore.name}. The other ${Math.max(0, listItemCount - firstAtStoreCount)} stay on the list.`
							: `This starts a new shopping session using all ${listItemCount} items in “${baseListName || 'this list'}”.`}</AlertDescription>
					</div>
				</Alert> : null}
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
					{loading ? 'Starting…' : selectedStore ? `Start Shopping at ${selectedStore.name}` : 'Start Shopping'}
				</Button>
			</DialogFooter>
		</SheetDialog>
		<StorePickerDialog
			open={storePickerOpen}
			onOpenChange={setStorePickerOpen}
			title='Choose Store'
			description='Shop at one store, or the whole list. Stores come from your receipts.'
			confirmLabel='Use Store'
			onPick={handleStorePick}
			wholeListChoice={{ itemCount: listItemCount, storeItemCounts, unassignedCount }}
			onPickWholeList={() => { setSelectedStore(null); setStorePickerOpen(false) }}
			pending={storePending}
			testId={`start-shopping-store-picker-${baseListId}`}
		/>
		</>
	)
}
