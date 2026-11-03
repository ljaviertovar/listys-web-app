'use client'

import { useState, type FormEvent } from 'react'

import { ChoiceRow, SheetDialog } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { RadioGroup } from '@/components/ui/radio-group'
import type { AvailableReceipt } from '@/lib/api/endpoints'

import { toReceiptChoice } from './helpers/to-receipt-choice'
import { useAvailableReceipts } from './hooks/use-available-receipts'

interface ChooseUploadedReceiptSheetProps {
	sessionId: string
	open: boolean
	onOpenChange: (open: boolean) => void
	/** The receipt the user picked; the trip review opens for it and nothing changes until that is confirmed. */
	onChoose: (receiptId: string) => void
	onUploadNew: () => void
}

/** Picks one of the receipts already uploaded and still free to attach to this trip. */
export function ChooseUploadedReceiptSheet({ sessionId, open, onOpenChange, onChoose, onUploadNew }: ChooseUploadedReceiptSheetProps) {
	const { state, reload } = useAvailableReceipts(sessionId, open)

	return (
		<SheetDialog
			open={open}
			onOpenChange={onOpenChange}
			title='Choose an Uploaded Receipt'
			description='Pick the receipt that belongs to this trip. You review it before anything changes.'
			testId='choose-uploaded-receipt-sheet'
		>
			{/* Mounted only while open, so a new visit starts without the previous choice. */}
			{open ? (
				<ChooseReceiptContent
					state={state}
					onRetry={() => void reload()}
					onCancel={() => onOpenChange(false)}
					onChoose={onChoose}
					onUploadNew={onUploadNew}
				/>
			) : null}
		</SheetDialog>
	)
}

type ContentState =
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'ready'; receipts: AvailableReceipt[] }

interface ChooseReceiptContentProps {
	state: ContentState
	onRetry: () => void
	onCancel: () => void
	onChoose: (receiptId: string) => void
	onUploadNew: () => void
}

/** What the chooser shows for each state of the list; exported so the states can be rendered on their own. */
export function ChooseReceiptContent({ state, onRetry, onCancel, onChoose, onUploadNew }: ChooseReceiptContentProps) {
	const [selected, setSelected] = useState('')

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (selected) onChoose(selected)
	}

	if (state.status === 'loading') {
		return <p role='status' data-testid='choose-receipt-loading' className='text-sm text-muted-foreground'>Loading your receipts…</p>
	}

	if (state.status === 'error') {
		return (
			<div role='alert' data-testid='choose-receipt-error' className='flex flex-col gap-3 rounded-2xl bg-destructive/10 p-3 text-sm'>
				<p>We couldn’t load your receipts.</p>
				<Button type='button' variant='secondary' size='sm' className='self-start' onClick={onRetry}>Try Again</Button>
			</div>
		)
	}

	if (state.receipts.length === 0) {
		return (
			<div data-testid='choose-receipt-empty' className='flex flex-col gap-3'>
				<p className='text-sm text-muted-foreground'>You don’t have any uploaded receipts available for this trip.</p>
				<Button type='button' size='primary' onClick={onUploadNew}>Upload New Receipt</Button>
			</div>
		)
	}

	return (
		<form data-testid='choose-receipt-form' onSubmit={submit} noValidate className='flex flex-col gap-4'>
			<div className='max-h-72 overflow-y-auto'>
				<RadioGroup value={selected} onValueChange={setSelected} aria-label='Uploaded receipts'>
					{state.receipts.map(receipt => (
						<ChoiceRow key={receipt.id} option={toReceiptChoice(receipt)} />
					))}
				</RadioGroup>
			</div>
			<DialogFooter variant='sheet'>
				<Button type='button' variant='secondary' size='primary' onClick={onCancel}>Cancel</Button>
				<Button type='submit' size='primary' disabled={!selected}>Review Receipt</Button>
			</DialogFooter>
		</form>
	)
}
