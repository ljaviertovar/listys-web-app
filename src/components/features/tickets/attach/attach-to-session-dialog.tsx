'use client'

import Link from 'next/link'
import { Add01Icon, Alert02Icon, CheckmarkCircle02Icon, InformationCircleIcon, MinusSignIcon, TickDouble02Icon } from '@hugeicons/core-free-icons'

import { CategoryCollapseControl, EntityLabel, SheetDialog, StatTile, StatusCard, useCategorySectionExpansion } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { ChangeLineSheet } from './change-line-sheet'
import type { TripReview } from './hooks/use-trip-review'
import { TRIP_REVIEW_COPY } from './trip-review-copy'
import { TripReviewSection } from './trip-review-section'
import { DeleteReceiptButton } from '../receipt/delete-receipt-button'

/** Decisions stay local until attachment; closing either sheet never writes to the trip or list. */
export function AttachToSessionDialog({ actions }: { actions: TripReview }) {
	const review = actions.review
	const listName = actions.trip?.base_list?.name ?? 'your'
	const active = actions.trip?.status === 'active'
	const editingLine = review?.sections.flatMap(section => section.lines).find(line => line.id === actions.editingLineId)
	const store = actions.receiptStore ?? review?.resultingStore
	const duplicateStore = actions.submitError?.reason === 'SESSION_HAS_STORE_RECEIPT'
	const sectionDescriptors = review ? [
		...review.sections.filter(section => section.lines.length > 0).map(section => ({ id: `attach-review-section-${section.id}`, defaultOpen: true })),
		...(review.checkedNotOnReceipt.length > 0 ? [{ id: 'attach-review-section-checked-not-on-receipt', defaultOpen: true }] : []),
		...(review.notCheckedNotOnReceipt.length > 0 ? [{ id: 'attach-review-section-not-checked-not-on-receipt', defaultOpen: false }] : []),
	] : []
	const expansion = useCategorySectionExpansion(sectionDescriptors)
	return (
		<>
			<SheetDialog open={actions.open} onOpenChange={actions.setOpen}
				title={active ? 'Review receipt' : actions.trip ? `Attach to ${actions.trip.name}` : 'Attach to trip'}
				testId='attach-to-session-dialog'>
				{actions.open && actions.trip ? <div className='flex min-w-0 flex-col gap-4' data-testid='attach-session-review'>
					{actions.reviewLoading ? <p role='status' className='text-sm text-muted-foreground'>Loading trip items…</p> : null}
					{actions.reviewError ? <StatusCard tone='danger' icon={Alert02Icon} title='Couldn’t load the review' description='Try again to compare this receipt with your trip.' testId='attach-review-load-error' role='alert'
						actions={<Button type='button' variant='secondary' size='primary' onClick={actions.retryReview}>Retry</Button>} /> : null}
					{!actions.reviewLoading && !actions.reviewError && review ? actions.submitError ? (
						<StatusCard tone='danger' icon={Alert02Icon}
							title={duplicateStore ? 'This trip already has a receipt from this store.' : 'Couldn’t attach the receipt'}
							description={duplicateStore ? 'Nothing was changed. View the trip’s receipts to check the receipt already attached.' : 'Nothing was changed. Try again in a moment.'} testId='attach-review-submit-error' role='alert'
							actions={duplicateStore ? <><Button asChild size='primary'><Link href={`/shopping/${actions.trip.id}`} onClick={actions.closeReview}>View Trip Receipts</Link></Button><Button type='button' variant='secondary' size='primary' onClick={actions.closeReview}>Close Review</Button></>
								: <><Button type='button' size='primary' disabled={actions.submitting} onClick={() => void actions.retrySubmit()}>{actions.submitting ? 'Attaching…' : 'Try Again'}</Button><Button type='button' variant='secondary' size='primary' disabled={actions.submitting} onClick={actions.closeReview}>Attach Later</Button></>} />
					) : <>
						<p className='text-sm leading-normal text-slate-600 dark:text-muted-foreground'>{TRIP_REVIEW_COPY.intro(listName)}</p>
						{store ? <EntityLabel name={store.name} testId='attach-review-store' /> : <p data-testid='attach-review-store-unconfirmed' className='text-sm text-muted-foreground'>Store not confirmed</p>}
						<div data-testid='attach-review-summary' role='status' aria-live='polite' className='grid grid-cols-3 gap-2'>
							<StatTile testId='attach-review-stat-matched' variant='white' value={review.counts.matched} label='Matched' icon={TickDouble02Icon} iconTone='success' />
							<StatTile testId='attach-review-stat-new' variant='white' value={review.counts.added} label={`New to ${listName}`} icon={Add01Icon} iconTone='primary' />
							<StatTile testId='attach-review-stat-left-out' variant='white' value={review.counts.leftOut} label='Left out' icon={MinusSignIcon} />
						</div>
						{active ? <StatusCard tone='info' icon={InformationCircleIcon} title='The trip is still shopping'
							description={`Only the items on this receipt are checked off. The other ${review.checkedNotOnReceipt.length + review.notCheckedNotOnReceipt.length} items stay on the list for your next store.`} testId='attach-review-still-shopping' /> : null}
						{review.allMatch ? <StatusCard tone='success' icon={CheckmarkCircle02Icon} title='Everything you checked is on the receipt' description='Nothing to add or fix.' testId='attach-review-all-match' /> : null}
						<div>
							{sectionDescriptors.length > 0 ? (
								<CategoryCollapseControl allCollapsed={expansion.allCollapsed} onToggle={expansion.toggleAll} testId='attach-review-collapse-control' />
							) : null}
							{review.sections.map(section => {
								const id = `attach-review-section-${section.id}`
				return <TripReviewSection key={section.id} id={section.id} listName={listName} lines={section.lines} onChange={actions.setEditingLineId} open={expansion.isOpen(id, true)} onOpenChange={open => expansion.onOpenChange(id, open)} />
							})}
							{review.checkedNotOnReceipt.length > 0 ? <TripReviewSection id='checked-not-on-receipt' listName={listName} items={review.checkedNotOnReceipt} onChange={actions.setEditingLineId} open={expansion.isOpen('attach-review-section-checked-not-on-receipt', true)} onOpenChange={open => expansion.onOpenChange('attach-review-section-checked-not-on-receipt', open)} /> : null}
							{review.notCheckedNotOnReceipt.length > 0 ? <TripReviewSection id='not-checked-not-on-receipt' listName={listName} items={review.notCheckedNotOnReceipt} onChange={actions.setEditingLineId} open={expansion.isOpen('attach-review-section-not-checked-not-on-receipt', false)} onOpenChange={open => expansion.onOpenChange('attach-review-section-not-checked-not-on-receipt', open)} /> : null}
						</div>
						<label className='flex items-center justify-between gap-4 text-sm font-semibold' htmlFor='attach-total'>
							<span className='flex flex-col gap-1'>Total paid<span className='text-xs font-normal text-muted-foreground'>Read from the receipt.</span></span>
							<Input id='attach-total' aria-label='Total paid' type='number' min='0' step='0.01' variant='amount' size='lg' className='w-36' value={actions.totalInput} onChange={event => actions.setTotalInput(event.target.value)} placeholder='0.00' />
						</label>
						<DialogFooter variant='sheet'>
							{active ? <Button type='button' variant='secondary' size='primary' disabled={actions.submitting || !actions.totalIsValid} onClick={() => void actions.submit(true)}>Attach and Complete Trip</Button>
								: <Button type='button' variant='secondary' size='primary' disabled={actions.submitting} onClick={actions.closeReview}>Cancel</Button>}
							<Button type='button' size='primary' disabled={actions.submitting || !actions.totalIsValid} onClick={() => void actions.submit(!active)}>
								{actions.submitting ? 'Attaching…' : active ? 'Attach Receipt' : review.confirmLabel}
							</Button>
						</DialogFooter>
						<DeleteReceiptButton ticketId={actions.receiptId} returnHref={`/shopping/${actions.trip.id}?details=1`} />
					</> : null}
				</div> : null}
			</SheetDialog>
			{editingLine && !actions.submitError ? <ChangeLineSheet key={editingLine.id} line={editingLine} match={actions.matches.find(match => match.ticket_item_id === editingLine.id)}
				items={actions.sessionItems} listName={listName} onClose={() => actions.setEditingLineId(null)} onSave={decision => actions.setDecision(editingLine.id, decision)} /> : null}
		</>
	)
}
