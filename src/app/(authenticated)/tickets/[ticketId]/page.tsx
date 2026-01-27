import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTicket } from '@/actions/tickets'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon, InformationCircleIcon, ListViewIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils/format-date'
import { TicketItemsSelector } from '@/components/features/tickets/ticket-items-selector'
import { TicketImage } from '@/components/features/tickets/ticket-image'
import { TicketActions } from '@/components/features/tickets/ticket-actions'
import PageHeader from '@/components/app/page-header'
import BackLink from '@/components/app/back-link'
import PageContainer from '@/components/app/page-container'

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
		<>
			<PageHeader
				title={`Ticket: ${ticket.store_name || 'Unknown'}`}
				desc={`Uploaded on ${formatDate(createdAt)} at ${formatTime(createdAt)}`}
			/>
			<PageContainer>
				<div className='flex items-start justify-between'>
					<BackLink
						href='/tickets'
						label='Back to Tickets'
					/>
				</div>

				{ticket.base_list_id && baseListName && (
					<Alert variant='info'>
						<HugeiconsIcon
							icon={InformationCircleIcon}
							strokeWidth={2}
						/>
						<AlertTitle>Merged to Base List</AlertTitle>
						<AlertDescription>
							<span className='text-foreground'>
								This ticket has been added to the base list:{' '}
								<Link href={`/base-lists/${ticket.base_list_id}/edit`}>{baseListName}</Link>
							</span>
						</AlertDescription>
					</Alert>
				)}
				<div className='grid gap-6 lg:grid-cols-2'>
					{/* Ticket Image */}
					<Card className='hover:border-primary/50 transition-colors'>
						<CardHeader>
							<div className='flex gap-2 items-center'>
								<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-full'>
									<HugeiconsIcon
										icon={Invoice01Icon}
										strokeWidth={2}
										className='h-6 w-6 text-primary'
									/>
								</span>
								<CardTitle className='text-lg'>Ticket Photo</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<TicketImage imagePath={ticket.image_path} />
						</CardContent>
					</Card>

					{/* Extracted Items */}
					<Card className='hover:border-primary/50 transition-colors'>
						<CardHeader>
							<div className='flex items-center justify-end gap-1'>
								<Badge
									variant={
										ticket.ocr_status === 'processing'
											? 'processing'
											: ticket.ocr_status === 'completed'
												? 'completed'
												: ticket.ocr_status === 'failed'
													? 'failed'
													: 'pending'
									}
								>
									{ticket.ocr_status.charAt(0).toUpperCase() + ticket.ocr_status.slice(1)}
								</Badge>
							</div>
							<div className='flex gap-2 items-center'>
								<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-full'>
									<HugeiconsIcon
										icon={ListViewIcon}
										strokeWidth={2}
										className='h-6 w-6 text-primary'
									/>
								</span>
								<div className='flex flex-col'>
									<CardTitle className='text-lg'>Extracted Items</CardTitle>
									<CardDescription className='text-xs'>
										{ticket.ocr_status === 'completed'
											? `${ticket.items?.length || 0} items found`
											: ticket.ocr_status === 'processing'
												? 'Processing receipt...'
												: ticket.ocr_status === 'failed'
													? 'Failed to process receipt'
													: 'Waiting to process...'}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<TicketItemsSelector
								ticketId={ticketId}
								items={ticket.items || []}
								status={ticket.ocr_status || 'pending'}
								isMerged={!!ticket.base_list_id}
							/>
						</CardContent>
						<CardFooter className='justify-end'>
							<TicketActions ticket={ticket} />
						</CardFooter>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
