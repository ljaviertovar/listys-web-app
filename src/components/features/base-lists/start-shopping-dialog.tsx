'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, InformationCircleIcon, Loading03Icon, ListViewIcon, ShoppingCart02Icon, Store03Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DialogFooter } from '@/components/ui/dialog'
import { LoadingState, RowIcon, SheetDialog } from '@/components/commons'
import { StorePickerDialog, type StorePick } from '@/components/features/stores'
import { createStore } from '@/lib/api/endpoints/stores'
import { buildSessionPriceEstimate, startedSessionHref } from '@/components/features/shopping-sessions'
import { createShoppingSession } from '@/lib/api/endpoints'
import useActiveSessionStore from '@/stores/active-session'
import { cn, formatCurrency, formatItemName } from '@/utils'
import type { BaseListItemWithStoreSummary, Store } from '@/types'

import { describeTripStart } from './helpers/describe-trip-start'
import { useDialogItems } from './hooks/use-dialog-items'
import { getNeededSync } from './items/sync/needed-sync-registry'
import { shoppingActionMode, summarizeItemsByStore } from './items/helpers/store-session-summary'

/** The trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. `children` replaces the cart icon and "Start Shopping" label. */
interface Props extends ButtonProps {
	baseListId: string
	baseListName?: string
	itemsCount?: number
	/** Every item of the list. Omit it where the screen does not have them: the sheet reads them when it opens. */
	items?: BaseListItemWithStoreSummary[]
	/** Tells apart a second trigger for the same list. */
	triggerTestId?: string
	/** True only when this base list has an active session. */
	sessionActive?: boolean
	activeSessionId?: string | null
	showBlockedNotice?: boolean
}

/**
 * "Start Shopping": the button and the sheet that confirms an optional store-scoped session.
 */
export function StartShoppingDialog({
	baseListId,
	baseListName,
	itemsCount,
	items: providedItems,
	triggerTestId,
	children,
	className,
	sessionActive = false,
	activeSessionId,
	showBlockedNotice = false,
	...buttonProps
}: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [conflictingTripId, setConflictingTripId] = useState<string | null>(null)
	const [storePickerOpen, setStorePickerOpen] = useState(false)
	const [selectedStore, setSelectedStore] = useState<Store | null>(null)
	const [storePending, setStorePending] = useState(false)
	const storePendingRef = useRef(false)
	const loadingRef = useRef(false)
	const router = useRouter()
	const setActiveSession = useActiveSessionStore(s => s.setActiveSession)
	const ownedTripId = useActiveSessionStore(s => s.sessions.find(session => session.isOwned)?.id)
	const resumeId = activeSessionId || ownedTripId || conflictingTripId
	const { state: itemsState, load: loadItems } = useDialogItems(baseListId, providedItems)
	const items = itemsState.status === 'ready' ? itemsState.items : []
	const itemsReady = itemsState.status === 'ready'
	const trip = describeTripStart({ items, listName: baseListName || 'this list', store: selectedStore, formatName: formatItemName })
	// What was confirmed on screen may be stale after a refused start.
	const refreshItems = () => {
		if (providedItems) router.refresh()
		else void loadItems()
	}

	const handleConfirm = async () => {
		if (loadingRef.current || resumeId || !itemsReady) return
		loadingRef.current = true
		setLoading(true)
		try {
			// The server builds the trip from the saved checks, so the ones still waiting go first.
			await getNeededSync(baseListId).flush()
			const { data, error, activeSessionId } = await createShoppingSession({
				base_list_id: baseListId,
				name: baseListName ? `${baseListName.slice(0, 94)} trip` : 'Shopping trip',
				store_id: selectedStore?.id ?? null,
				...(trip.onlyChecked ? { only_needed: true } : {}),
			})
			if (error) {
				if (activeSessionId) {
					toast.error(error as string)
					setConflictingTripId(activeSessionId)
					setOpen(false)
					setLoading(false)
					loadingRef.current = false
					return
				}
				throw new Error(error as string)
			}

			if (data?.id) {
				// Update store optimistically
				setActiveSession({ id: data.id, name: data.name, store_id: data.store_id, base_list_id: baseListId, isOwned: true })
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
			refreshItems()
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
	const checkedItems = items.filter(item => item.needed_at)
	const listItemCount = itemsReady ? items.length : (itemsCount ?? 0)

	const isEmpty = itemsReady ? items.length === 0 : itemsCount === 0
	// The trip copies these items, so the list's own averages are what it would cost; nothing is shown without a known price.
	const estimate = buildSessionPriceEstimate(trip.estimateItems, items)

	if (resumeId && !sessionActive) {
		if (!showBlockedNotice) return null

		return (
			<Alert variant='info' role='note' data-testid={`blocked-start-shopping-${baseListId}`}>
				<RowIcon icon={InformationCircleIcon} tone='primary' size='alert' />
				<div>
					<AlertTitle>Finish your current trip before starting another.</AlertTitle>
					<div className='mt-2'>
						<Button size='alert-action' variant='outline' onClick={() => router.push(`/shopping/${resumeId}`)}>
							Resume Shopping
						</Button>
					</div>
				</div>
			</Alert>
		)
	}

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
				Resume Shopping
			</Button>
		)
	}

	return (
		<>
		<SheetDialog
			open={open && !storePickerOpen}
			onOpenChange={next => {
				if (storePickerOpen || loading) return
				// A screen without the items reads them after any check still waiting to be saved.
				if (next && !open && !providedItems) void getNeededSync(baseListId).flush().catch(() => {}).then(loadItems)
				setOpen(next)
			}}
			trigger={
				<Button
					size='lg'
					{...buttonProps}
					disabled={buttonProps.disabled}
					className={cn('w-full', className)}
					// Several of these sit on one page, so the accessible name says which list each one starts.
					aria-label={baseListName ? `Start shopping ${baseListName}` : undefined}
					data-testid={triggerTestId ?? `start-shopping-${baseListId}`}
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
							<span className='break-all text-sm font-semibold text-foreground'>{baseListName || 'Shopping list'}</span>
							<span className='text-xs leading-normal text-muted-foreground'>{itemsReady ? trip.summary : `${listItemCount} ${listItemCount === 1 ? 'item' : 'items'} in this list`}</span>
						</div>
					</div>
					{itemsReady && !isEmpty ? <div data-testid='start-shopping-estimate' className='flex items-end justify-between gap-3 border-t border-border pt-3'>
						<div className='flex min-w-0 flex-col gap-1'>
							<span className='text-xs leading-[1.3] text-muted-foreground'>Estimated total</span>
							<span className='text-xs leading-normal text-muted-foreground'>From {estimate.pricedCount} of {estimate.itemCount} {estimate.itemCount === 1 ? 'item' : 'items'}</span>
						</div>
						{estimate.pricedCount > 0 ? <span className='font-mono text-lg leading-none font-medium text-foreground tabular-nums'>≈ {formatCurrency(estimate.total)}</span> : <span className='text-xs text-muted-foreground'>No known prices</span>}
					</div> : null}
				</div>
				{isEmpty ? <p className='text-sm leading-normal text-muted-foreground dark:text-muted-foreground'>This base list has no items. Add items before starting a shopping session.</p> : null}
				{itemsState.status === 'loading' ? <LoadingState testId='start-shopping-items-loading' label='Loading your items…' /> : null}
				{itemsState.status === 'error' ? (
					<Alert variant='destructive' data-testid='start-shopping-items-error'>
						<RowIcon icon={Alert02Icon} tone='danger' size='alert' />
						<div>
							<AlertTitle>We couldn’t load this list</AlertTitle>
							<AlertDescription>
								<Button type='button' size='alert-action' variant='outline' onClick={() => void loadItems()}>Try Again</Button>
							</AlertDescription>
						</div>
					</Alert>
				) : null}
				<div className='flex items-center justify-between gap-3 rounded-2xl bg-muted px-3.5 py-3'>
					<span className='flex min-w-0 items-center gap-3'>
						<RowIcon icon={selectedStore ? Store03Icon : ListViewIcon} tone={selectedStore ? 'store' : 'primary'} size='md' testId='start-shopping-scope-icon' />
						<span className='flex min-w-0 flex-col gap-0.5'>
							<span className='truncate text-sm font-semibold text-foreground'>{selectedStore?.name ?? 'All stores'}</span>
							<span className='text-xs leading-normal text-foreground'>{itemsReady ? trip.scopeDetail : `${listItemCount} ${listItemCount === 1 ? 'item' : 'items'}`}</span>
						</span>
					</span>
					<Button type='button' size='lg' variant='outline' onClick={() => setStorePickerOpen(true)} disabled={loading || !itemsReady}>
						{selectedStore ? 'Change' : 'Choose Store'}
					</Button>
				</div>
				{itemsReady && !isEmpty ? <Alert variant={trip.notice.tone} role='note' data-testid='start-shopping-guidance'>
					<RowIcon icon={Alert02Icon} tone={trip.notice.tone === 'warning' ? 'warning' : 'primary'} size='alert' testId='start-shopping-guidance-icon' />
					<div>
						<AlertTitle>{trip.notice.title}</AlertTitle>
						<AlertDescription className='break-words'>
							{trip.notice.lead}<strong className='font-semibold'>{trip.notice.strong}</strong>{trip.notice.rest}
						</AlertDescription>
					</div>
				</Alert> : null}
			</div>
				<DialogFooter variant='sheet' spacing='section'>
				<Button
					size='lg'
					type='button'
					variant='outline'
					onClick={() => setOpen(false)}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					size='lg'
					type='button'
					onClick={handleConfirm}
					disabled={loading || isEmpty || !itemsReady}
					data-testid='confirm-start-shopping'
				>
					<HugeiconsIcon
						icon={loading ? Loading03Icon : ShoppingCart02Icon}
						strokeWidth={loading ? 2 : 1.5}
						aria-hidden='true'
						className={cn('size-4.5', loading && 'animate-spin motion-reduce:animate-none')}
					/>
					{loading ? 'Starting…' : trip.buttonLabel}
				</Button>
			</DialogFooter>
		</SheetDialog>
		<StorePickerDialog
			open={storePickerOpen}
			onOpenChange={setStorePickerOpen}
			title='Choose Store'
			description='Shop at one store, or at all of them. Stores come from your receipts.'
			confirmLabel='Use Store'
			onPick={handleStorePick}
			wholeListChoice={{
				itemCount: listItemCount,
				storeItemCounts,
				unassignedCount,
				checked: checkedItems.length > 0 ? { total: checkedItems.length, byStore: summarizeItemsByStore(checkedItems).counts } : undefined,
			}}
			onPickWholeList={() => { setSelectedStore(null); setStorePickerOpen(false) }}
			pending={storePending}
			testId={`start-shopping-store-picker-${baseListId}`}
		/>
		</>
	)
}
