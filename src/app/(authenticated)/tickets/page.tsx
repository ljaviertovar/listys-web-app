import Link from 'next/link'
import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'

import { PageHeader, PageContainer, PageFooterAction, BackLink } from '@/components/app'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Badge } from '@/components/ui/badge'
import { ArrowRight01Icon, Invoice01Icon } from '@hugeicons/core-free-icons'

import { getTickets } from '@/actions/tickets'

import { createClient } from '@/lib/supabase/server'

import { formatDate, formatTime } from '@/utils/format-date'

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
					<Card className='flex min-h-100 flex-col items-center justify-center'>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={Invoice01Icon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No receipts yet</h3>
								<p className='text-sm text-muted-foreground'>Upload your first receipt to get started</p>
							</div>
							<UploadTicketDialog />
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{formattedTickets.map(ticket => {
							const isMerged = !!ticket.base_list_id

							return (
								<Card
									key={ticket.id}
									className='hover:border-primary/50 transition-colors cursor-pointer group'
								>
									<Link href={`/tickets/${ticket.id}`}>
										<CardHeader className='gap-0'>
											<div className='flex items-center justify-end gap-1'>
												{isMerged && <Badge variant='merged'>Merged</Badge>}
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
											<div className='flex gap-2 items-center'>
												<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg'>
													<HugeiconsIcon
														icon={Invoice01Icon}
														strokeWidth={2}
														className='h-6 w-6 text-primary'
													/>
												</span>

												<div className='flex flex-col'>
													<CardTitle className='flex items-center justify-between text-lg truncate w-full max-w-[20ch]'>
														{ticket.store_name || 'Unknown Base List'}
													</CardTitle>
													<CardDescription className='text-xs'>
														{ticket.formattedDate} - {ticket.formattedTime}
													</CardDescription>
												</div>
											</div>
										</CardHeader>
										<CardContent className='py-4'>
											<span className='text-muted-foreground'>
												{isMerged && ticket.base_list?.name
													? `Merged to: ${ticket.base_list.name}`
													: ticket.base_list?.name || 'No base list assigned'}
											</span>
										</CardContent>
										<CardFooter className='justify-between items-center'>
											{(ticket.total_items ?? 0) > 0 && <span>{ticket.total_items} items</span>}
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
