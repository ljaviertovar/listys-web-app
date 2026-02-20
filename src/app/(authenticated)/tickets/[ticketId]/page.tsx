import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, PageContainer, BackLink, CardHeaderContent } from '@/components/app'
import { TicketItemsSelector, TicketImage, TicketActions, TicketStatusListener } from '@/components/features/tickets'
import { Invoice01Icon, ListViewIcon } from '@hugeicons/core-free-icons'

import { getTicket } from '@/actions/tickets'

import { createClient } from '@/lib/supabase/server'

import { formatCurrency } from '@/utils/format-currency'
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

	// Format date on server side
	const formattedDate = ticket.created_at ? formatDate(new Date(ticket.created_at)) : 'Unknown'
	const formattedTime = ticket.created_at ? formatTime(new Date(ticket.created_at)) : ''
	const ticketItems = ticket.items || []
	const extractedItemsCount = ticket.total_items ?? ticketItems.length
	const pricedItemsCount = ticketItems.filter((item: { price?: number | null }) => item.price !== null).length
	const calculatedTotal = ticketItems.reduce(
		(sum: number, item: { price?: number | null; quantity?: number | null }) =>
			sum + (item.price ?? 0) * (item.quantity ?? 1),
		0,
	)

	return (
		<>
			<PageHeader
				title={`${ticket.store_name || 'Unknown Receipt'}`}
				desc={`Uploaded on ${formattedDate} at ${formattedTime}`}
			/>
			<PageContainer>
				<BackLink
					href='/tickets'
					label='Back to Receipts'
				/>

				<div className='w-full flex gap-6 flex-col-reverse md:flex-row'>
					{/* Ticket Image */}
					<Card
						className='flex-1 hover:border-primary/50 transition-colors h-fit'
						size='sm'
					>
						<CardHeader>
							<div className='flex gap-2 items-center'>
								<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg'>
									<HugeiconsIcon
										icon={Invoice01Icon}
										strokeWidth={2}
										className='h-6 w-6 text-primary'
									/>
								</span>
								<CardTitle className='text-lg'>Receipt Photo</CardTitle>
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

					{/* Extracted Items */}
					<Card
						className='flex-1 hover:border-primary/50 transition-colors'
						size='sm'
					>
						<CardHeader className='flex gap-2 items-start justify-between'>
							<CardHeaderContent
								icon={ListViewIcon}
								title='Extracted Items'
								description={ticket.ocr_status === 'completed' ? `${ticket.items?.length || 0} items found` : undefined}
							/>

							<TicketStatusListener
								ticketId={ticketId}
								initialStatus={(ticket.ocr_status as any) || 'pending'}
							/>
						</CardHeader>
						<CardContent>
							<TicketItemsSelector
								ticketId={ticketId}
								items={ticketItems}
								status={ticket.ocr_status || 'pending'}
								ocrError={(ticket as any).ocr_error}
							/>

							{ticket.ocr_status === 'completed' && ticketItems.length > 0 && (
								<div className='mt-4 border-t pt-4 space-y-2'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Extracted items</span>
										<span className='font-medium'>{extractedItemsCount}</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>Calculated total</span>
										<span className='font-semibold'>{formatCurrency(calculatedTotal)}</span>
									</div>
									{pricedItemsCount < ticketItems.length && (
										<p className='text-xs text-muted-foreground'>
											Calculated using {pricedItemsCount} of {ticketItems.length} items with price.
										</p>
									)}
								</div>
							)}
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
