import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Store03Icon } from '@hugeicons/core-free-icons'
import { PageHeader, PageContainer } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { TicketsList, UploadTicketDialog, buildTicketListItem, type TicketsListItem } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'

import { getTickets } from '@/lib/api/endpoints'

import { createClient } from '@/lib/supabase/server'

export default async function TicketsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: tickets, error } = await getTickets('direct')

	// Format tickets on server side to avoid date serialization issues
	const listItems: TicketsListItem[] = (tickets || []).map(ticket => buildTicketListItem(ticket))

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Dashboard' }}
				title='Receipts'
				desc='Upload and manage your shopping receipts'
				aside={(
					<Button asChild variant='outline-surface' size='header-action'>
						<Link href='/stores'><HugeiconsIcon icon={Store03Icon} strokeWidth={1.8} className='size-3.5 text-violet-600' aria-hidden='true' />My Stores</Link>
					</Button>
				)}
			>
				{/* Phones upload from the tab bar's raised button, so this one only exists from `md`. */}
				<div className='hidden md:block'>
					<UploadTicketDialog
						variant='secondary'
						className='w-auto'
					/>
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
