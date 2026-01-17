import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTickets } from '@/actions/tickets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, Invoice01Icon, CloudUploadIcon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { UploadTicketDialog } from '@/components/features/tickets/upload-ticket-dialog'
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

	return (
		<div className='container mx-auto max-w-7xl space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<Link
						href='/dashboard'
						className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
					>
						<HugeiconsIcon
							icon={ArrowLeft02Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
						Back to Dashboard
					</Link>
					<h1 className='text-3xl font-bold'>Tickets</h1>
					<p className='text-muted-foreground'>Upload and manage your shopping receipts</p>
				</div>
				<UploadTicketDialog />
			</div>

			{error && (
				<div className='rounded-lg bg-destructive/10 p-4 text-sm text-destructive'>Error loading tickets: {error}</div>
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
						const statusColors: Record<string, string> = {
							pending: 'bg-yellow-100 text-yellow-800',
							processing: 'bg-blue-100 text-blue-800',
							completed: 'bg-green-100 text-green-800',
							failed: 'bg-red-100 text-red-800',
						}
						const statusColor = statusColors[ticket.ocr_status || 'pending']

						return (
							<Link
								key={ticket.id}
								href={`/tickets/${ticket.id}`}
							>
								<Card className='transition-colors hover:bg-muted/50'>
									<CardHeader>
										<CardTitle className='flex items-center justify-between'>
											<span className='flex items-center gap-2'>
												<HugeiconsIcon
													icon={Invoice01Icon}
													strokeWidth={2}
												/>
												{ticket.store_name || 'Unknown Store'}
											</span>
											<Badge className={statusColor}>{ticket.ocr_status}</Badge>
										</CardTitle>
										<CardDescription>
											{formatDate(createdAt)} - {formatTime(createdAt)}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>{ticket.group?.name || 'No group'}</span>
											{ticket.total_items > 0 && <span className='font-medium'>{ticket.total_items} items</span>}
										</div>
									</CardContent>
								</Card>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
