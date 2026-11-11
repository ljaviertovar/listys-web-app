'use client'

import { useId } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, ListViewIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChoiceRow, RowIcon, SheetDialog } from '@/components/commons'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMergeToBaseList } from './hooks/use-merge-to-base-list'
import { MergeReviewStep } from './merge-review-step'
import { MergeResultSheet } from './merge-result-sheet'
import { shouldShowReceiptStoreUnconfirmedNote } from './helpers/receipt-store-note'
import type { ScreenDecisions } from './helpers/merge-review'
import type { ReceiptSelectionBreakdown } from '../receipt/helpers/receipt-selection-breakdown'

interface Props {
	open: boolean
	defaultBaseListId?: string | null
	onOpenChange: (open: boolean) => void
	ticketId: string
	selectedItemIds: string[]
	/** The receipt's lines, so Review Matches can name them. */
	lines: Array<{ id: string; name: string }>
	/** Matches the user already decided on the receipt screen; the review starts from them when adding to the same list. */
	initialDecisions?: ScreenDecisions | null
	storeConfirmed: boolean
	/** How many of the included lines add an item and how many update one, for the option that adds to the list. */
	breakdown?: ReceiptSelectionBreakdown | null
	onSuccess: (baseListId: string) => void
	onReceiptAttached?: (sessionId: string) => void
	/** The receipt screen shows "Saving…" while the lines are on their way (this sheet is closed by then). */
	onSavingChange?: (saving: boolean) => void
	/** Where the lines come from, for the summary sheet that follows a save. */
	receipt: { storeName: string; date: string | null }
}

export function MergeToBaseListDialog({ open, defaultBaseListId, onOpenChange, ticketId, selectedItemIds, lines, initialDecisions, storeConfirmed, breakdown = null, onSuccess, onReceiptAttached, onSavingChange, receipt }: Props) {
	const fieldId = useId()
	const {
		mode,
		setMode,
		baseLists,
		listLabels,
		selectedBaseListId,
		setSelectedBaseListId,
		newListName,
		setNewListName,
		loading,
		loadingData,
		loadFailed,
		error,
		setError,
		loadData,
		handleSubmit,
		step,
		backToChoose,
		review,
		outcome,
		dismissOutcome,
		retry,
	} = useMergeToBaseList({ open, defaultBaseListId, ticketId, selectedItemIds, lines, initialDecisions, onOpenChange, onSuccess, onReceiptAttached, onSavingChange })

	const hasLists = baseLists.length > 0
	const reviewing = step === 'review' && review.state.status === 'ready'
	const listName = listLabels.get(selectedBaseListId) ?? baseLists.find(list => list.id === selectedBaseListId)?.name ?? ''
	const itemsLabel = `${selectedItemIds.length} ${selectedItemIds.length === 1 ? 'Item' : 'Items'}`

	return (
		<>
		<SheetDialog
			open={open}
			onOpenChange={isOpen => !loading && onOpenChange(isOpen)}
			testId='merge-to-base-list-dialog'
			title={reviewing ? 'Review Matches' : 'Add or Update Items'}
			descriptionVariant={reviewing ? 'sheet' : 'body'}
			description={reviewing
				? `Check how these items are added to “${listName}”. Nothing is added until you confirm.`
				: mode === 'new'
					? <>Create a new list with the <span className='font-mono font-semibold text-foreground'>{selectedItemIds.length}</span> selected item{selectedItemIds.length !== 1 ? 's' : ''}.</>
					: <><span className='font-mono font-semibold text-foreground'>{selectedItemIds.length}</span> selected item{selectedItemIds.length !== 1 ? 's' : ''}. New products are added to the list; products already on it are updated.</>}
			className='sm:max-w-125'
		>
					<div className='px-0.5 py-1'>
						{loadingData ? (
							<div className='flex items-center justify-center py-8'>
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className='h-8 w-8 animate-spin text-primary motion-reduce:animate-none'
								/>
							</div>
						) : loadFailed ? (
							<div data-testid='merge-to-base-list-error' className='flex flex-col items-center gap-4 py-8 text-center'>
								<p role='alert' className='text-sm text-destructive'>{error}</p>
								<Button type='button' size='primary' variant='secondary' onClick={loadData}>
									Try Again
								</Button>
							</div>
						) : (
							<form
								onSubmit={handleSubmit}
								noValidate
								className={reviewing ? 'space-y-8' : 'space-y-4'}
							>
								{review.state.status === 'ready' && reviewing ? (
									<MergeReviewStep
										review={review.state.review}
										listItems={review.state.listItems}
										decisions={review.decisions}
										onDecide={review.decide}
										disabled={loading}
									/>
								) : null}

								{reviewing ? null : hasLists ? (
									<RadioGroup
										aria-label='Destination'
										spacing='snug'
										value={mode}
										onValueChange={(value: 'existing' | 'new') => {
											setMode(value)
											setError(null)
										}}
									>
										<ChoiceRow
											variant='card'
											testId='merge-mode-existing'
											option={{ value: 'existing', label: 'Add to existing list', note: breakdown ? `${breakdown.added} new · ${breakdown.updated} updated` : undefined }}
										/>
										<ChoiceRow
											variant='card'
											testId='merge-mode-new'
											option={{ value: 'new', label: 'Create new list', note: `All ${selectedItemIds.length} ${selectedItemIds.length === 1 ? 'item is' : 'items are'} added as new` }}
										/>
									</RadioGroup>
								) : (
									<p data-testid='merge-to-base-list-no-lists' className='text-sm text-muted-foreground'>
										You have no lists yet. Name one and these items will start it.
									</p>
						)}
						{shouldShowReceiptStoreUnconfirmedNote(storeConfirmed, reviewing) ? (
							<p data-testid='receipt-store-unconfirmed-note' className='text-sm text-muted-foreground'>
								This receipt has no confirmed store. You can still add its items to your list.
							</p>
						) : null}

						{reviewing ? null : mode === 'existing' && hasLists ? (
							<div className='space-y-2'>
								<Label id={`${fieldId}-list-label`} htmlFor={`${fieldId}-list`}>List</Label>
								<Select
									value={selectedBaseListId}
									onValueChange={value => {
										setSelectedBaseListId(value)
										setError(null)
									}}
								>
									<SelectTrigger
										id={`${fieldId}-list`}
										aria-labelledby={`${fieldId}-list-label`}
										aria-required='true'
										aria-invalid={error?.toLowerCase().includes('list') ? true : undefined}
										aria-describedby={error?.toLowerCase().includes('list') ? `${fieldId}-error` : undefined}
										size='filter'
									>
										<SelectValue placeholder='Select a shopping list' />
									</SelectTrigger>
									<SelectContent size='filter'>
										{baseLists.map(list => (
											<SelectItem
												key={list.id}
												size='filter'
												value={list.id}
											>
												<RowIcon icon={ListViewIcon} tone='primary' size='stat' testId='merge-list-option-icon' />
												{listLabels.get(list.id) ?? list.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className='space-y-2'>
								<Label htmlFor={`${fieldId}-name`}>List Name</Label>
								<Input
									id={`${fieldId}-name`}
									required
									aria-required='true'
									aria-invalid={error?.toLowerCase().includes('name') ? true : undefined}
									aria-describedby={error?.toLowerCase().includes('name') ? `${fieldId}-error` : undefined}
									value={newListName}
									onChange={e => {
										setNewListName(e.target.value)
										if (error?.toLowerCase().includes('name')) setError(null)
									}}
									placeholder='e.g., Weekly Groceries'
								/>
							</div>
						)}

						{error && <p id={`${fieldId}-error`} role='alert' className='text-sm text-destructive'>{error}</p>}

						<div className='grid w-full grid-cols-2 gap-2'>
							<Button
								type='button'
								variant='secondary'
								size='primary'
								disabled={loading}
								onClick={() => (reviewing ? backToChoose() : onOpenChange(false))}
							>
								{reviewing ? 'Back' : 'Cancel'}
							</Button>
							<Button
								type='submit'
								size='primary'
								disabled={loading || (mode === 'existing' ? !selectedBaseListId : !newListName.trim())}
							>
								{loading ? (
									<>
										<HugeiconsIcon
											icon={Loading03Icon}
											strokeWidth={2}
											className='mr-2 h-4 w-4 animate-spin motion-reduce:animate-none'
										/>
										{mode === 'existing' && !reviewing ? 'Checking…' : 'Adding…'}
									</>
								) : (
									mode === 'new' ? `Create List with ${itemsLabel}` : `Add ${itemsLabel}`
								)}
							</Button>
						</div>
					</form>
						)}
					</div>
		</SheetDialog>
		<MergeResultSheet outcome={outcome} receipt={receipt} onRetry={retry} onClose={dismissOutcome} />
		</>
	)
}
