import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeader, PageContainer } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { TicketsList, UploadTicketDialog, type TicketsListItem } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'

import { getTickets } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime, getReceiptStoreLabel } from '@/utils'

export default async function TicketsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: tickets, error } = await getTickets()

	// Format tickets on server side to avoid date serialization issues
	const listItems: TicketsListItem[] = (tickets || []).map(ticket => ({
		id: ticket.id,
		storeName: getReceiptStoreLabel(ticket),
		status: ticket.ocr_status,
		itemsCount: ticket.total_items,
		uploadedLabel: ticket.created_at
			? `Uploaded ${formatDate(new Date(ticket.created_at))} · ${formatTime(new Date(ticket.created_at))}`
			: 'Upload date unknown',
	}))

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Receipts'
				desc='Upload and manage your shopping receipts'
			>
				<div className='flex items-center gap-2'>
					{/* The tab bar has no room for My Stores, so phones reach it from here (desktop also has it in the sidebar). */}
					<Button
						asChild
						variant='secondary'
						size='primary'
					>
						<Link href='/stores'>My Stores</Link>
					</Button>
					{/* Phones upload from the tab bar's raised button, so this one only exists from `md`. */}
					<div className='hidden md:block'>
						<UploadTicketDialog
							variant='secondary'
							className='w-auto'
						/>
					</div>
				</div>
			</PageHeader>

			<PageContainer>
				{error ? (
					<RetryableError message='We couldn’t load your receipts.' href='/tickets' testId='receipts-load-error' />
				) : <TicketsList tickets={listItems} />}
			</PageContainer>
		</>
	)
}
