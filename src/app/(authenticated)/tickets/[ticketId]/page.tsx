import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTicket } from '@/actions/tickets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils/format-date'
import { TicketItemsSelector } from '@/components/features/tickets/ticket-items-selector'
import { TicketImage } from '@/components/features/tickets/ticket-image'
import { TicketActions } from '@/components/features/tickets/ticket-actions'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
	const { ticketId } = await params

	const supabase = await createClient()

	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: ticket, error } = await getTicket(ticketId)

	if (error || !ticket) {
		redirect('/tickets')
	}

	// Fetch base list if ticket is merged
	let baseListName = null
	if (ticket.base_list_id && ticket.base_list) {
		baseListName = ticket.base_list.name
	}

	const createdAt = new Date(ticket.created_at)

	return (
		<main className='flex-1 overflow-y-auto'>
			<PageHeader
				title={ticket.store_name || 'Receipt'}
				desc={`Uploaded on ${formatDate(createdAt)} at ${formatTime(createdAt)}`}
			/>
			<div className='container mx-auto max-w-7xl space-y-6 p-6'>
				<div className='flex items-start justify-between'>
					<BackLink
						href='/tickets'
						label='Back to Tickets'
					/>
					<div className='flex items-center gap-2'>
						<Badge variant={ticket.ocr_status === 'completed' ? 'default' : 'outline'}>{ticket.ocr_status}</Badge>
						<TicketActions ticket={ticket} />
					</div>
				</div>

				{ticket.base_list_id && baseListName && (
					<div className='rounded-lg border border-primary/20 bg-primary/5 p-4'>
						<div className='flex items-start gap-3'>
							<div className='flex-1'>
								<h3 className='font-semibold text-primary'>Merged to Base List</h3>
								<p className='mt-1 text-sm text-muted-foreground'>
									This ticket has been added to the base list:{' '}
									<Link
										href={`/base-lists/${ticket.base_list_id}/edit`}
										className='font-medium text-primary underline hover:no-underline'
									>
										{baseListName}
									</Link>
								</p>
							</div>
						</div>
					</div>
				)}

				<div className='grid gap-6 lg:grid-cols-2'>
					{/* Ticket Image */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<HugeiconsIcon
									icon={Invoice01Icon}
									strokeWidth={2}
								/>
								Receipt Image
							</CardTitle>
						</CardHeader>
						<CardContent>
							<TicketImage imagePath={ticket.image_path} />
						</CardContent>
					</Card>

					{/* Extracted Items */}
					<Card>
						<CardHeader>
							<CardTitle>Extracted Items</CardTitle>
							<CardDescription>
								{ticket.ocr_status === 'completed'
									? `${ticket.items?.length || 0} items found`
									: ticket.ocr_status === 'processing'
										? 'Processing receipt...'
										: ticket.ocr_status === 'failed'
											? 'Failed to process receipt'
											: 'Waiting to process...'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TicketItemsSelector
								ticketId={ticketId}
								items={ticket.items || []}
								status={ticket.ocr_status || 'pending'}
								isMerged={!!ticket.base_list_id}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	)
}
