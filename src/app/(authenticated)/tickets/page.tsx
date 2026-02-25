import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { PageHeader, PageContainer, PageFooterAction, BackLink, CardFooterContent } from '@/components/app'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Badge } from '@/components/ui/badge'
import { ArrowRight01Icon, Invoice01Icon, SearchVisualIcon } from '@hugeicons/core-free-icons'

import { getTickets } from '@/lib/api/endpoints/tickets'

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
	const formattedTickets = (tickets || []).map((ticket: any) => ({
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
						variant='premium'
						className='group relative flex h-full cursor-pointer flex-col bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 gap-0 py-4'
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
						{formattedTickets.map((ticket: any) => {
							return (
								<Link
									key={ticket.id}
									href={`/tickets/${ticket.id}`}
								>
									<Card
										variant='premium'
										className='group relative flex h-full cursor-pointer flex-col bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 gap-0 py-4'
									>
										<div className='flex items-center justify-end gap-1 px-4'>
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

										<CardFooterContent
											count={ticket.total_items}
											coutLabel={ticket.total_items === 1 ? 'Extracted Item' : 'Extracted Items'}
											linkText='View details'
										/>
									</Card>
								</Link>
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
