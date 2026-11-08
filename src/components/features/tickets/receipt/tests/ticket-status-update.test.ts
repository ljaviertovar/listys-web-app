import { describe, expect, it } from 'vitest'

import { applyTicketStatusUpdate } from '../helpers/ticket-status-update'

describe('applyTicketStatusUpdate', () => {
	it('asks for a refresh the first time a receipt is read', () => {
		expect(applyTicketStatusUpdate('completed', false)).toEqual({ status: 'completed', refresh: true })
	})

	it('asks for a refresh when the reading fails, because the page has an error to load', () => {
		expect(applyTicketStatusUpdate('failed', false)).toEqual({ status: 'failed', refresh: true })
	})

	it('only updates the chip while the receipt is still being read', () => {
		expect(applyTicketStatusUpdate('processing', false)).toEqual({ status: 'processing', refresh: false })
		expect(applyTicketStatusUpdate('pending', false)).toEqual({ status: 'pending', refresh: false })
	})

	it('never asks for a second refresh', () => {
		expect(applyTicketStatusUpdate('completed', true)).toEqual({ status: 'completed', refresh: false })
	})

	it('reads an unknown status as not started', () => {
		expect(applyTicketStatusUpdate('mystery', false)).toEqual({ status: 'pending', refresh: false })
	})
})
