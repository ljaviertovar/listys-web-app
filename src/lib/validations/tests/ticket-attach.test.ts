import { describe, expect, it } from 'vitest'

import { ticketSessionMatchesQuerySchema } from '../api/common'
import { attachTicketToSessionSchema } from '../ticket'

const sessionId = 'd2b53ebc-1452-4dde-9a4d-59ccfe09a26f'
const receiptItemId = 'c6f96548-d442-420f-8b38-e20ee296a2cd'
const sessionItemId = 'bfb658f0-fd47-4263-88a3-784437e2b15e'

describe('ticketSessionMatchesQuerySchema', () => {
	it('accepts a session UUID and rejects malformed or unknown query fields', () => {
		expect(ticketSessionMatchesQuerySchema.safeParse({ shopping_session_id: sessionId }).success).toBe(true)
		expect(ticketSessionMatchesQuerySchema.safeParse({ shopping_session_id: 'bad' }).success).toBe(false)
		expect(ticketSessionMatchesQuerySchema.safeParse({ shopping_session_id: sessionId, other: 'value' }).success).toBe(false)
	})
})

describe('attachTicketToSessionSchema', () => {
	it('accepts explicit links, added lines and a nullable total', () => {
		expect(attachTicketToSessionSchema.safeParse({
			shopping_session_id: sessionId,
			links: [{ ticket_item_id: receiptItemId, shopping_session_item_id: sessionItemId }],
			added_item_ids: [],
			total_amount: 18.25,
		}).success).toBe(true)
	})

	it('accepts a line explicitly selected to be added and an omitted total', () => {
		expect(attachTicketToSessionSchema.safeParse({
			shopping_session_id: sessionId,
			links: [{ ticket_item_id: receiptItemId, shopping_session_item_id: null }],
		}).success).toBe(true)
	})

	it('rejects negative totals, malformed identifiers, unknown fields and duplicate receipt lines', () => {
		expect(attachTicketToSessionSchema.safeParse({ shopping_session_id: sessionId, total_amount: -1 }).success).toBe(false)
		expect(attachTicketToSessionSchema.safeParse({ shopping_session_id: 'bad' }).success).toBe(false)
		expect(attachTicketToSessionSchema.safeParse({ shopping_session_id: sessionId, extra: true }).success).toBe(false)
		expect(attachTicketToSessionSchema.safeParse({
			shopping_session_id: sessionId,
			links: [{ ticket_item_id: receiptItemId, shopping_session_item_id: sessionItemId }],
			added_item_ids: [receiptItemId],
		}).success).toBe(false)
	})
})
