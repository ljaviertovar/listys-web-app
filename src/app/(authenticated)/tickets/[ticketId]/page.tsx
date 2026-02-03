import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader, PageContainer } from '@/components/app'
import { TicketItemsSelector } from '@/components/features/tickets/ticket-items-selector'
import { TicketImage } from '@/components/features/tickets/ticket-image'
import { TicketActions } from '@/components/features/tickets/ticket-actions'
import { TicketStatusListener } from '@/components/features/tickets/ticket-status-listener'
import BackLink from '@/components/app/back-link'
import { Invoice01Icon, InformationCircleIcon, ListViewIcon } from '@hugeicons/core-free-icons'

import { getTicket } from '@/actions/tickets'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime } from '@/utils/format-date'

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

	const createdAt = ticket.created_at ? new Date(ticket.created_at) : new Date()

	return (
		<>
			<PageHeader
				title={`${ticket.store_name || 'Unknown Ticket'}`}
				desc={`Uploaded on ${formatDate(createdAt)} at ${formatTime(createdAt)}`}
			/>
			<PageContainer>
				<BackLink
					href='/tickets'
					label='Back to Tickets'
				/>

				{ticket.base_list_id && baseListName && (
					<Alert variant='info'>
						<HugeiconsIcon
							icon={InformationCircleIcon}
							strokeWidth={2}
						/>
						<AlertTitle>Merged to Base List</AlertTitle>
						<AlertDescription>
							This ticket has been added to the base list:{' '}
							<Link href={`/base-lists/${ticket.base_list_id}/edit`}>{baseListName}</Link>
						</AlertDescription>
					</Alert>
				)}

				<div className='grid gap-6 lg:grid-cols-2'>
					{/* Realtime status listener (client) */}
					<TicketStatusListener ticketId={ticketId} />
					{/* Extracted Items */}
					<Card
						className='hover:border-primary/50 transition-colors'
						size='sm'
					>
						<CardHeader className='flex gap-2 items-start justify-between'>
							<div className='flex gap-2 items-center'>
								<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-full'>
									<HugeiconsIcon
										icon={ListViewIcon}
										strokeWidth={2}
										className='h-5 w-5 text-primary'
									/>
								</span>
								<div className='flex flex-col'>
									<CardTitle className='text-lg'>Extracted Items</CardTitle>
									<CardDescription className='text-sm'>
										{ticket.ocr_status === 'completed' ? `${ticket.items?.length || 0} items found` : null}
									</CardDescription>
								</div>
							</div>
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
								{ticket.ocr_status ? ticket.ocr_status.charAt(0).toUpperCase() + ticket.ocr_status.slice(1) : 'Pending'}
							</Badge>
						</CardHeader>
						<CardContent>
							<TicketItemsSelector
								ticketId={ticketId}
								items={ticket.items || []}
								status={ticket.ocr_status || 'pending'}
								isMerged={!!ticket.base_list_id}
								ocrError={(ticket as any).ocr_error}
							/>
						</CardContent>
						<CardFooter className='justify-end'>
							<TicketActions ticket={ticket} />
						</CardFooter>
					</Card>

					{/* Ticket Image */}
					<Card
						className='hover:border-primary/50 transition-colors'
						size='sm'
					>
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
							<TicketImage
								imagePaths={
									(ticket as any).image_paths && (ticket as any).image_paths.length > 0
										? (ticket as any).image_paths
										: ticket.image_path
											? [ticket.image_path]
											: []
								}
							/>
						</CardContent>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
