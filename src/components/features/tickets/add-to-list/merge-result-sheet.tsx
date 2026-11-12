'use client'

import { useRouter } from 'next/navigation'
import { Add01Icon, Alert02Icon, CheckmarkCircle02Icon, MinusSignCircleIcon } from '@hugeicons/core-free-icons'

import { RowIcon, SheetDialog, StatTile } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/** What happened to the lines the user sent to a list: they are in it (with the counts), or the list was not touched. */
export type MergeOutcome =
	| { kind: 'saved'; baseListId: string; listName: string; itemCount: number; counts: { added: number; updated: number; skipped: number } | null }
	| { kind: 'failed'; listName: string; itemCount: number; message: string }

interface MergeResultSheetProps {
	outcome: MergeOutcome | null
	/** Where the lines came from, for the "From No Frills · 19 Feb" line. */
	receipt: { storeName: string; date: string | null }
	onRetry: () => void
	onClose: () => void
}

/** The answer to "Add or Update" as a sheet over the receipt: the summary of what was saved, or why nothing was and how to try again. */
export function MergeResultSheet({ outcome, receipt, onRetry, onClose }: MergeResultSheetProps) {
	const router = useRouter()

	if (!outcome) return null

	// A saved receipt is shown as saved: the page reads it again once the summary is out of the way.
	const close = () => {
		onClose()
		if (outcome.kind === 'saved') router.refresh()
	}

	if (outcome.kind === 'failed') {
		return (
			<SheetDialog open onOpenChange={open => !open && onClose()} title="Couldn't Save" testId='merge-failed-sheet' fit>
				<div className='flex flex-col gap-4'>
					<Alert variant='receipt-danger' data-testid='merge-failed-alert'>
						<RowIcon icon={Alert02Icon} tone='danger' size='alert' testId='merge-failed-icon' />
						<AlertTitle>{outcome.listName ? `${outcome.listName} wasn’t updated` : 'Nothing was saved'}</AlertTitle>
						<AlertDescription>
							{outcome.message} Nothing was lost: your review and the {outcome.itemCount} selected {outcome.itemCount === 1 ? 'item is' : 'items are'} kept.
						</AlertDescription>
					</Alert>
					<div className='grid grid-cols-2 gap-2'>
						<Button type='button' variant='secondary' size='primary' onClick={onClose}>Cancel</Button>
						<Button type='button' size='primary' onClick={onRetry}>Try Again</Button>
					</div>
				</div>
			</SheetDialog>
		)
	}

	const { counts } = outcome

	return (
		<SheetDialog open onOpenChange={open => !open && close()} title={outcome.listName ? `Saved to ${outcome.listName}` : 'Saved'} testId='merge-saved-sheet' fit>
			<div className='flex flex-col gap-4'>
				<p data-testid='merge-saved-from' className='text-sm leading-normal text-body dark:text-muted-foreground'>
					From <b className='font-semibold text-foreground'>{receipt.storeName}</b>
					{receipt.date ? ` · ${receipt.date}` : ''} · {outcome.itemCount} {outcome.itemCount === 1 ? 'item' : 'items'}.
				</p>
				{counts ? (
					<div data-testid='merge-saved-summary' role='status' className='grid grid-cols-3 gap-2'>
						<StatTile testId='merge-saved-stat-updated' variant='white' value={counts.updated} label='Updated' icon={CheckmarkCircle02Icon} iconTone='success' />
						<StatTile testId='merge-saved-stat-new' variant='white' value={counts.added} label='New items' icon={Add01Icon} iconTone='primary' />
						<StatTile testId='merge-saved-stat-skipped' variant='white' value={counts.skipped} label='Skipped' icon={MinusSignCircleIcon} />
					</div>
				) : null}
				<div className='grid grid-cols-2 gap-2'>
					<Button type='button' variant='secondary' size='primary' onClick={() => router.push('/tickets')}>Back to Receipts</Button>
					<Button type='button' size='primary' onClick={() => (outcome.baseListId ? router.push(`/base-lists/${outcome.baseListId}/edit`) : close())}>View List</Button>
				</div>
			</div>
		</SheetDialog>
	)
}
