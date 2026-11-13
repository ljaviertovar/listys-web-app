'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Attachment01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { ConfirmSheet, RowIcon, SheetDialog } from '@/components/commons'
import { completeShoppingSession } from '@/lib/api/endpoints'
import { useActiveSessionStore } from '@/stores/active-session'

import { listFullMessage } from './helpers/list-full-message'
import { useTripSync } from './hooks/use-trip-sync'

/**
 * Progress history outlives route navigation, so returning to an already-complete
 * checklist does not reopen the confirmation just because the sheet remounted.
 */
const lastProgressBySession = new Map<string, number>()

interface CompleteSessionSheetProps {
	sessionId: string
	checked: number
	total: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Completing a shopping session. With items still unticked it says how many, so the user can go back; with all of them
 * ticked it offers to save the trip. Completing always saves the checked items to the history and the base list: there is
 * no option to skip it.
 */
export function CompleteSessionSheet({ sessionId, checked, total, open, onOpenChange }: CompleteSessionSheetProps) {
	const { controller, barrier } = useTripSync(sessionId)
	const [loading, setLoading] = useState(false)
	const [saveError, setSaveError] = useState(false)
	const requestInFlight = useRef(false)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	const progress = total > 0 ? Math.round((checked / total) * 100) : 0
	const unchecked = total - checked
	const allChecked = total > 0 && unchecked === 0

	// Opens by itself once, when the last item gets ticked (progress goes from below 100 to 100); closing it does not reopen it.
	useEffect(() => {
		// A first visit that already shows 100% has no previous value, so it does not open by itself.
		const previous = lastProgressBySession.get(sessionId) ?? progress
		if (progress === 100 && previous < 100) onOpenChange(true)
		lastProgressBySession.set(sessionId, progress)
	}, [sessionId, progress, onOpenChange])

	const handleComplete = async (attachReceipt = false) => {
		if (requestInFlight.current) return
		requestInFlight.current = true
		setLoading(true)
		setSaveError(false)
		try {
			const complete = () => completeShoppingSession(sessionId, {})
			const { data, error } = await barrier(complete)
			if (error) throw new Error(error)
			controller?.receive([], false)
			const fullMessage = listFullMessage(data?.sync?.over_limit_count ?? 0)
			if (fullMessage) toast.info(fullMessage)
			// Clear store optimistically
			clearActiveSession(sessionId)
			onOpenChange(false)
			// The saved trip page owns receipt upload so its state and trip context stay together.
			router.push(`/shopping/${sessionId}?saved=1${attachReceipt ? '&receipt=add' : ''}`)
			router.refresh()
		} catch (err) {
			console.error('Failed to complete session:', err)
			setSaveError(true)
		} finally {
			requestInFlight.current = false
			setLoading(false)
		}
	}

	const description = <>You collected <b className='font-mono font-semibold text-foreground'>{checked}</b> of <b className='font-mono font-semibold text-foreground'>{total}</b> items.</>
	const learningAlert = (count: number, testId: string) => (
		<Alert variant='receipt-info' role='note' data-testid={testId}>
			<RowIcon icon={Alert02Icon} tone='primary' size='alert' />
			<div>
				<AlertTitle>Pantry learns from this trip</AlertTitle>
				<AlertDescription>{count === total
					? `All ${count} items move up in your usual order.`
					: `The ${count} items you collected move up in your usual order.`}</AlertDescription>
			</div>
		</Alert>
	)
	const errorAlert = (
		<Alert variant='receipt-danger' role='alert' data-testid='complete-session-error'>
			<RowIcon icon={Alert02Icon} tone='danger' size='alert' />
			<div>
				<AlertTitle>Couldn&apos;t save the trip</AlertTitle>
				<AlertDescription>You&apos;re offline. Your checks are kept on this device.</AlertDescription>
			</div>
		</Alert>
	)

	if (allChecked) {
		return (
			<SheetDialog
				open={open}
				onOpenChange={next => !loading && onOpenChange(next)}
				title={<span className='sr-only'>Trip Complete</span>}
				role='alertdialog'
				testId='complete-session-sheet'
			>
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col items-center text-center'>
						<RowIcon icon={CheckmarkCircle02Icon} tone='success' size='saved' testId='complete-session-success-icon' />
						<h2 className='mt-3 font-display text-lg leading-normal font-semibold tracking-tight text-foreground'>Trip Complete</h2>
						<p className='mt-1 text-sm leading-normal text-muted-foreground'>You collected all <b className='font-mono font-semibold text-foreground'>{total}</b> items. Nothing is left on this trip.</p>
					</div>
					{saveError ? errorAlert : learningAlert(total, 'complete-session-learning')}
				</div>
				<DialogFooter variant='sheet-stack' className='mt-4'>
					<Button type='button' size='primary' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>Keep Shopping</Button>
					{saveError ? <Button type='button' size='primary' variant='default' onClick={() => handleComplete(false)} disabled={loading} data-testid='complete-session-confirm'>Try Again</Button> : <>
						<Button type='button' size='primary' variant='secondary' onClick={() => handleComplete(false)} disabled={loading}>Save Trip</Button>
						<Button type='button' size='primary' variant='default' onClick={() => handleComplete(true)} disabled={loading} data-testid='complete-session-confirm'>
							<HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.8} className='size-4' aria-hidden='true' />
							{loading ? 'Saving…' : 'Save and Upload Receipt'}
						</Button>
					</>}
				</DialogFooter>
			</SheetDialog>
		)
	}

	return (
		<ConfirmSheet
			open={open}
			onOpenChange={onOpenChange}
			title='Complete Shopping?'
			description={description}
			cancelLabel='Keep Shopping'
			confirmLabel={saveError ? 'Try Again' : 'Complete Shopping'}
			loadingLabel='Completing Shopping…'
			loading={loading}
			onConfirm={() => handleComplete(false)}
			testId='complete-session-sheet'
		>
			{saveError ? errorAlert : <>
				{learningAlert(checked, 'complete-session-learning')}
				{unchecked > 0 ? <Alert variant='receipt-info' role='note' data-testid='complete-session-uncollected'>
					<RowIcon icon={Alert02Icon} tone='primary' size='alert' />
					<div>
						<AlertTitle>Uncollected items stay in Pantry</AlertTitle>
						<AlertDescription>The {unchecked} {unchecked === 1 ? 'item you didn’t collect is' : 'items you didn’t collect are'} waiting for your next trip.</AlertDescription>
					</div>
				</Alert> : null}
			</>}
		</ConfirmSheet>
	)
}
