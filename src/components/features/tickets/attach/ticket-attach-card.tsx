'use client'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RowIcon } from '@/components/commons'
import { Button } from '@/components/ui/button'
import type { TicketItem } from '@/types'

import { AttachToSessionDialog } from './attach-to-session-dialog'
import { useAttachToSession } from './hooks/use-attach-to-session'
import { shouldShowAttachCard } from './helpers/receipt-attachment-visibility'

export function TicketAttachCard({
	ticketId,
	items,
	receiptStore,
	totalAmount,
}: {
	ticketId: string
	items: TicketItem[]
	receiptStore: { id: string; name: string } | null
	totalAmount: number | null
}) {
	const actions = useAttachToSession({ ticketId, items, receiptStore, totalAmount })
	if (actions.candidatesLoading) return null
	if (!actions.candidatesError && !shouldShowAttachCard({ read: true, attached: false, addedToList: false, candidateCount: actions.candidates.length })) return null

	return (
		<Card data-testid='ticket-attach-card'><CardContent><div className='flex flex-col gap-3'>
			<div className='flex items-start gap-3'>
				<RowIcon icon={ArrowRight01Icon} tone='primary' size='lg' testId='ticket-attach-icon' />
				<div className='min-w-0 flex-1'>
					<h2 className='text-sm font-semibold'>You uploaded this receipt from a trip</h2>
					<p className='mt-1 text-sm text-muted-foreground'>Attach it to update the trip and save its prices.</p>
				</div>
			</div>
			{actions.candidatesError ? (
				<Alert variant='destructive'><AlertDescription>
					<p>{actions.candidatesError}</p>
					<Button type='button' variant='secondary' size='sm' onClick={() => void actions.reloadCandidates()}>Retry</Button>
				</AlertDescription></Alert>
			) : (
				<Button type='button' size='lg' onClick={actions.openDialog}>
					Review {actions.candidates[0].name}
				</Button>
			)}
			{actions.candidates.length ? <AttachToSessionDialog actions={actions} /> : null}
		</div></CardContent></Card>
	)
}
