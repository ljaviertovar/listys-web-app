import type { ReactNode } from 'react'

import { GhostReceipt, type GhostVariant } from '../ghost-receipt'
import { TornPaper } from '../torn-paper'
import { EmptyState } from './empty-state'

interface EmptyStateCardProps {
	/** The ticket's printed head: what the screen lists and how many it has ("Receipts", "0 receipts"). */
	stub: { label: string; count: string }
	/** What the ghost on the ticket sketches; the default is a receipt being scanned. */
	ghost?: GhostVariant
	title: string
	description: ReactNode
	children?: ReactNode
	testId: string
}

/** The empty state of a screen: a torn ticket on the app ground, with a ghost of what will appear there. */
export function EmptyStateCard({ stub, ghost = 'receipt', title, description, children, testId }: EmptyStateCardProps) {
	return (
		<TornPaper
			surface='card'
			padding='empty'
			testId={testId}
			className='mx-auto w-full max-w-lg'
		>
			<div className='flex justify-between gap-3 border-b-[1.5px] border-dashed border-paper-line pb-2.5 font-mono text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase dark:border-border'>
				<span>{stub.label}</span>
				<span>{stub.count}</span>
			</div>
			<EmptyState
				testId={`${testId}-content`}
				variant='ticket'
				media={
					<GhostReceipt
						variant={ghost}
						testId={`${testId}-ghost`}
					/>
				}
				title={title}
				description={description}
			>
				{children}
			</EmptyState>
		</TornPaper>
	)
}
