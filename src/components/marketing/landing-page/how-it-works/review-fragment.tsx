'use client'

import { TicketItemRow } from '@/components/features/tickets'
import { Card } from '@/components/ui/card'
import type { TicketItem } from '@/types'

const CHERRY_TOMATOES: TicketItem = {
	id: 'landing-cherry-tom',
	ticket_id: 'landing-receipt',
	name: 'Cherry Tom 1kg',
	normalized_name: null,
	category: 'Produce',
	quantity: 1,
	unit: 'kg',
	price: 3.75,
	created_at: null,
	shopping_session_item_id: null,
}

const SUGGESTION = { id: 'landing-cherry-tomatoes', name: 'Cherry Tomatoes' }

// The picture never acts: every way to settle the match is a no-op.
const NO_ACTIONS = { confirm: () => undefined, chooseAnother: () => undefined, addAsNew: () => undefined }

/** Step 02 of how it works: one receipt line with the match Listys suggests, drawn by the app's own TicketItemRow. */
export function ReviewFragment() {
	return (
		<Card size='flush'>
			<div className='rounded-2xl bg-muted'>
				<TicketItemRow
					item={CHERRY_TOMATOES}
					canSelect
					selected
					listName='Pantry'
					actions={NO_ACTIONS}
					line={{
						item: CHERRY_TOMATOES,
						match: { ticket_item_id: CHERRY_TOMATOES.id, match: 'none', base_list_item: null, suggestion: SUGGESTION },
						section: 'check',
						badges: ['confirm-match'],
						proposal: SUGGESTION,
						decision: null,
						target: null,
						remembered: false,
					}}
				/>
			</div>
		</Card>
	)
}
