'use client'

import { useEffect, useState } from 'react'

import { getTicket } from '@/lib/api/endpoints/tickets'
import type { TicketItem } from '@/types'

export interface TripReceiptDetails {
	created_at?: string | null
	image_path: string | null
	image_paths?: string[] | null
	items: TicketItem[]
	store_name: string | null
	total_amount: number | null
	total_items: number | null
}

interface ReceiptDetailsResult {
	ticketId: string
	details: TripReceiptDetails | null
	error: string | null
}

export function useTripReceiptDetails(ticketId: string, open: boolean) {
	const [result, setResult] = useState<ReceiptDetailsResult | null>(null)

	useEffect(() => {
		if (!open || !ticketId) return

		let current = true
		void getTicket<TripReceiptDetails>(ticketId).then(response => {
			if (!current) return
			if (response.error || !response.data) {
				setResult({ ticketId, details: null, error: 'We could not load this receipt. Try again later.' })
				return
			}
			setResult({ ticketId, details: response.data, error: null })
		}).catch(() => {
			if (current) setResult({ ticketId, details: null, error: 'We could not load this receipt. Try again later.' })
		})

		return () => { current = false }
	}, [open, ticketId])

	const currentResult = open && result?.ticketId === ticketId ? result : null
	return {
		details: currentResult?.details ?? null,
		loading: open && currentResult === null,
		error: currentResult?.error ?? null,
	}
}
