import { redirect } from 'next/navigation'

import { PageHeader, PageContainer } from '@/components/app'
import { SECONDARY_ACTION } from '@/components/app/helpers/a1-surface'
import { TicketsList, UploadTicketDialog, type TicketsListItem } from '@/components/features/tickets'

import { getTickets } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime } from '@/utils'

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
		storeName: ticket.store_name,
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
				{/* Phones upload from the tab bar's raised button, so this one only exists from `md`. */}
				<div className='hidden md:block'>
					<UploadTicketDialog
						variant='outline'
						className={SECONDARY_ACTION}
					/>
				</div>
			</PageHeader>

			<PageContainer>
				{error && (
					<div
						role='alert'
						className='rounded-[12px] bg-destructive/10 p-4 text-sm text-destructive'
					>
						Error loading tickets: {error}
					</div>
				)}

				<TicketsList tickets={listItems} />
			</PageContainer>
		</>
	)
}
