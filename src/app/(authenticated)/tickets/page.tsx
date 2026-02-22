import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Badge } from '@/components/ui/badge'
import { ArrowRight01Icon, Invoice01Icon, SearchVisualIcon } from '@hugeicons/core-free-icons'

import { getTickets } from '@/actions/tickets'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime } from '@/utils/format-date'
import CardHeaderContent from '@/components/app/card-header-content'

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
	const formattedTickets = (tickets || []).map(ticket => ({
		...ticket,
		formattedDate: ticket.created_at ? formatDate(new Date(ticket.created_at)) : 'Unknown',
		formattedTime: ticket.created_at ? formatTime(new Date(ticket.created_at)) : '',
	}))

	return (
		<>
			<PageHeader
				title='Receipts'
				desc='Upload and manage your shopping receipts'
			>
				<div className='justify-end hidden md:flex'>
					<div className='w-fit'>
						<UploadTicketDialog />
					</div>
				</div>
			</PageHeader>

			<PageContainer>
				<BackLink
					href='/dashboard'
					label='Back to Dashboard'
				/>

				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
						Error loading tickets: {error}
					</div>
				)}

				{!tickets || tickets.length === 0 ? (
					<Card
						className='flex min-h-100 flex-col items-center justify-center'
						size='sm'
						variant='premium'
					>
						<CardContent className='flex w-full max-w-md flex-col items-center pt-6 text-center'>
							<div className='flex h-16 w-16 items-center justify-center text-primary'>
								<HugeiconsIcon
									icon={SearchVisualIcon}
									strokeWidth={2}
									className='h-12 w-12'
								/>
							</div>
							<div className='mt-1'>
								<h3 className='text-xl font-semibold tracking-tight'>No receipts yet</h3>
								<p className='mt-1 text-sm text-muted-foreground'>Upload your first receipt to get started.</p>
							</div>
							<div className='mt-6 w-full max-w-65'>
								<UploadTicketDialog />
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{formattedTickets.map(ticket => {
							return (
								<Card
									key={ticket.id}
									variant='premium'
									size='sm'
									className='hover:bg-primary/1 hover:border-primary/50 transition-all cursor-pointer group'
								>
									<Link href={`/tickets/${ticket.id}`}>
										<CardHeader className='gap-0'>
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
													{ticket.ocr_status
														? ticket.ocr_status.charAt(0).toUpperCase() + ticket.ocr_status.slice(1)
														: 'Pending'}
												</Badge>
											</div>

											<CardHeaderContent
												icon={Invoice01Icon}
												title={ticket.store_name || 'Unknown Store'}
												description={`Uploaded: ${ticket.formattedDate} - ${ticket.formattedTime}`}
											/>
										</CardHeader>
										<CardContent className='py-4'></CardContent>
										<CardFooter className='justify-between items-center'>
											{(ticket.total_items ?? 0) > 0 && <span>{ticket.total_items} extracted items</span>}
											<div className='flex items-center text-sm text-primary transition-colors'>
												<span>View details</span>
												<HugeiconsIcon
													icon={ArrowRight01Icon}
													strokeWidth={2}
													className='h-4 w-4 transition-transform group-hover:translate-x-1'
												/>
											</div>
										</CardFooter>
									</Link>
								</Card>
							)
						})}
					</div>
				)}
			</PageContainer>

			<PageFooterAction>
				<div className='w-full md:hidden'>
					<UploadTicketDialog />
				</div>
			</PageFooterAction>
		</>
	)
}
