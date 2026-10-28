'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

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
		<section data-testid='ticket-attach-card' className='flex flex-col gap-3 rounded-3xl bg-card p-3 shadow-card md:p-4'>
			<div className='flex items-start gap-3'>
				<div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primary'>
					<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.8} className='size-5' aria-hidden='true' />
				</div>
				<div className='min-w-0 flex-1'>
					<h2 className='text-sm font-semibold'>This receipt may be from a recent trip</h2>
					<p className='mt-1 text-sm text-muted-foreground'>Attach it to finish the trip and save its prices.</p>
				</div>
			</div>
			{actions.candidatesError ? (
				<div role='alert' className='flex items-center justify-between gap-3 rounded-2xl bg-destructive/10 p-3 text-sm'>
					<p>{actions.candidatesError}</p>
					<Button type='button' variant='secondary' size='sm' onClick={() => void actions.reloadCandidates()}>Retry</Button>
				</div>
			) : (
				<Button type='button' size='primary' onClick={actions.openDialog}>
					{actions.candidates.length === 1 ? `Review ${actions.candidates[0].name}` : 'Choose a trip'}
				</Button>
			)}
			{actions.candidates.length ? <AttachToSessionDialog actions={actions} items={items} /> : null}
		</section>
	)
}
