import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTickets } from '@/actions/tickets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { UploadTicketDialog } from '@/components/features/tickets/upload-ticket-dialog'
import { formatDate, formatTime } from '@/utils/format-date'
import PageHeader from '@/components/app/page-header'
import PageContainer from '@/components/app/page-container'

export default async function TicketsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: tickets, error } = await getTickets()

	return (
		<>
			<PageHeader
				title='Tickets'
				desc='Upload and manage your shopping receipts'
			>
				<UploadTicketDialog />
			</PageHeader>
			<PageContainer>
				{error && (
					<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>
						Error loading tickets: {error}
					</div>
				)}

				{!tickets || tickets.length === 0 ? (
					<Card className='flex min-h-[400px] flex-col items-center justify-center'>
						<CardContent className='flex flex-col items-center space-y-4 pt-6'>
							<HugeiconsIcon
								icon={Invoice01Icon}
								strokeWidth={1.5}
								className='h-16 w-16 text-muted-foreground'
							/>
							<div className='text-center'>
								<h3 className='text-lg font-semibold'>No tickets yet</h3>
								<p className='text-sm text-muted-foreground'>Upload your first receipt to get started</p>
							</div>
							<UploadTicketDialog />
						</CardContent>
					</Card>
				) : (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{tickets.map(ticket => {
							const createdAt = new Date(ticket.created_at)
							const isMerged = !!ticket.base_list_id

							return (
								<Card
									key={ticket.id}
									className='transition-colors hover:border-primary/50'
								>
									<CardHeader>
										<CardTitle className='flex items-center justify-between'>
											<span className='flex items-center gap-2'>
												<HugeiconsIcon
													icon={Invoice01Icon}
													strokeWidth={2}
												/>
												{ticket.store_name || 'Unknown Store'}
											</span>
											<div className='flex items-center gap-2'>
												{isMerged && <Badge variant='secondary'>Merged</Badge>}
												<Badge variant={ticket.ocr_status === 'completed' ? 'default' : 'outline'}>
													{ticket.ocr_status}
												</Badge>
											</div>
										</CardTitle>
										<CardDescription>
											{formatDate(createdAt)} - {formatTime(createdAt)}
										</CardDescription>
									</CardHeader>
									<CardContent className='space-y-3'>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>{ticket.group?.name || 'No group assigned'}</span>
											{(ticket.total_items ?? 0) > 0 && <span className='font-medium'>{ticket.total_items} items</span>}
										</div>
										<Button
											variant='outline'
											className='w-full'
											asChild
										>
											<Link href={`/tickets/${ticket.id}`}>View Details</Link>
										</Button>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}
			</PageContainer>
		</>
	)
}
