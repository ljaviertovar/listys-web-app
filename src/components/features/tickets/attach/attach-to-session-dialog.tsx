'use client'

import { SheetDialog } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { TicketItem } from '@/types'

import { LinkItemDialog } from '../add-to-list/link-item-dialog'
import type { useAttachToSession } from './hooks/use-attach-to-session'

type Actions = ReturnType<typeof useAttachToSession>

export function AttachToSessionDialog({
	actions,
	items,
}: {
	actions: Actions
	items: TicketItem[]
}) {
	const sessionItems = actions.sessionItems
	const matchedLines = actions.matches.length
	return (
		<>
			<SheetDialog
				open={actions.open}
				onOpenChange={actions.setOpen}
				title={actions.candidate ? `Attach to ${actions.candidate.name}` : 'Choose a trip'}
				description={actions.candidate ? 'Review how this receipt will update the trip.' : 'Choose one of your recent trips for this receipt.'}
				testId='attach-to-session-dialog'
			>
			{actions.open && !actions.candidate ? (
				<div className='mt-3 flex min-w-0 flex-col gap-2' data-testid='attach-session-chooser'>
					<p className='text-sm text-muted-foreground'>Choose a trip for this receipt.</p>
					{actions.candidates.map(candidate => (
						<Button key={candidate.id} type='button' variant='secondary' size='lg' className='justify-between' onClick={() => actions.chooseCandidate(candidate.id)}>
							<span className='truncate'>{candidate.name} · {candidate.base_list.name}</span>
							<span className='shrink-0 text-xs'>{candidate.checked_count}/{candidate.item_count} checked</span>
						</Button>
					))}
				</div>
			) : null}
			{actions.open && actions.candidate ? (
				<div className='mt-3 flex min-w-0 flex-col gap-4' data-testid='attach-session-review'>
					{actions.reviewLoading ? <p role='status' className='text-sm text-muted-foreground'>Loading trip items…</p> : null}
					{actions.reviewError ? (
						<div role='alert' className='flex flex-col gap-2 rounded-2xl bg-destructive/10 p-3 text-sm'>
						<p>{actions.reviewError}</p>
						<Button type='button' variant='secondary' size='sm' onClick={actions.retryReview}>Retry</Button>
					</div>
					) : null}
					{!actions.reviewLoading && !actions.reviewError && actions.review ? (
						<>
							{matchedLines === 0 ? <p className='text-sm text-muted-foreground'>No receipt lines match this trip yet.</p> : null}
							<ReviewGroup title='Already checked' lines={actions.review.alreadyChecked} />
							<ReviewGroup title='Will be checked' lines={actions.review.willBeChecked} onLink={actions.setLinkingLineId} />
							<ReviewGroup title='Not in this trip' lines={actions.review.notInTrip} onAdd={(id, checked) => actions.toggleAdded(id, checked)} onLink={actions.setLinkingLineId} addedIds={actions.addedItemIds} />
							<div className='flex flex-col gap-2'>
								<p className='text-sm font-semibold'>Store</p>
								<p className='text-sm text-muted-foreground'>{actions.review.resultingStore?.name ?? 'No store recorded'}</p>
								{actions.review.storeMismatch ? <p role='alert' className='text-sm text-destructive'>The trip and receipt have different stores. Choose a trip from the same store.</p> : null}
							</div>
							<label className='flex flex-col gap-2 text-sm font-semibold' htmlFor='attach-total'>Total paid
								<Input id='attach-total' aria-label='Total paid' type='number' min='0' step='0.01' size='lg' value={actions.totalInput} onChange={event => actions.setTotalInput(event.target.value)} placeholder='0.00' />
							</label>
							{actions.submitError ? (
								<div role='alert' className='rounded-2xl bg-destructive/10 p-3 text-sm'>
									<p>{actions.submitError.message}</p>
								{actions.submitError.attached ? <p className='mt-1'>This receipt is already attached to another trip. Refresh to see its current status.</p> : null}
								</div>
							) : null}
							<DialogFooter variant='sheet'>
								<Button type='button' variant='secondary' size='primary' disabled={actions.submitting} onClick={() => actions.setOpen(false)}>Cancel</Button>
								<Button type='button' size='primary' disabled={actions.submitting || !actions.review || actions.review.storeMismatch || !actions.totalIsValid} onClick={() => void actions.submit()}>
									{actions.submitting ? 'Attaching…' : actions.review.confirmLabel}
								</Button>
							</DialogFooter>
						</>
					) : null}
				</div>
			) : null}
			</SheetDialog>
			<LinkItemDialog
				lineName={items.find(item => item.id === actions.linkingLineId)?.name ?? null}
				currentItemId={actions.linkingLineId ? actions.linkedItems.get(actions.linkingLineId) : null}
				items={sessionItems}
				onClose={() => actions.setLinkingLineId(null)}
				onLink={item => actions.linkingLineId && actions.linkLine(actions.linkingLineId, item.id)}
			/>
		</>
	)
}

function ReviewGroup({
	title,
	lines,
	onAdd,
	onLink,
	addedIds = [],
}: {
	title: string
	lines: Array<{ ticketItemId: string; name: string; shoppingSessionItem: { id: string; name: string; checked: boolean } | null }>
	onAdd?: (id: string, checked: boolean) => void
	onLink?: (id: string) => void
	addedIds?: string[]
}) {
	if (!lines.length) return null
	const testId = `attach-review-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
	return (
		<section data-testid={testId} className='flex flex-col gap-2' aria-label={title}>
			<h3 className='text-sm font-semibold'>{title}</h3>
			<ul className='flex flex-col divide-y divide-slate-100 rounded-2xl bg-muted px-3 dark:divide-border'>
				{lines.map(line => {
					const added = addedIds.includes(line.ticketItemId)
					return (
						<li key={line.ticketItemId} className='flex min-h-12 items-center gap-3 py-2'>
							<span className='min-w-0 flex-1 truncate text-sm'>{line.name}</span>
							{line.shoppingSessionItem ? <span className='truncate text-xs text-muted-foreground'>→ {line.shoppingSessionItem.name}</span> : null}
							{onAdd ? <label className='flex shrink-0 items-center gap-2 text-xs'><Checkbox size='lg' checked={added} onCheckedChange={checked => onAdd(line.ticketItemId, checked === true)} aria-label={`Add ${line.name} as purchased`} />Add as Purchased</label> : null}
							{onLink ? <Button type='button' variant='quiet' size='touch' onClick={() => onLink(line.ticketItemId)}>Link…</Button> : null}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
