'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar03Icon, DollarCircleIcon, ShoppingCart02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils/format-date'
import { CardHeaderContent } from '@/components/app'

interface Session {
	id: string
	name: string
	status: string | null
	started_at: string | null
	completed_at: string | null
	total_amount: number | null
	total_items?: number | null
	base_list: { name: string } | null
}

interface Props {
	session: Session
	href?: string
}

export function HistorySessionCard({ session, href }: Props) {
	const completedDate = session.completed_at ? new Date(session.completed_at) : null

	return (
		<Card
			className='hover:border-primary/50 transition-colors cursor-pointer group'
			size='sm'
		>
			<Link href={href ?? `/shopping/${session.id}`}>
				<CardHeader className='gap-0'>
					<div className='flex items-center justify-end'>
						<Badge variant='completed'>Completed</Badge>
					</div>

					<CardHeaderContent
						icon={ShoppingCart02Icon}
						title={session.name}
						description={`Shopping: ${completedDate ? `${formatDate(completedDate)} - ${formatTime(completedDate)}` : 'Date unknown'}`}
					/>
				</CardHeader>
				<CardContent className='pt-4'>
					<div className='space-y-2 mb-4'>
						{session.total_amount && (
							<div className='flex items-center gap-2 text-sm font-medium'>
								<HugeiconsIcon
									icon={DollarCircleIcon}
									strokeWidth={2}
									className='h-4 w-4'
								/>
								${session.total_amount.toFixed(2)}
							</div>
						)}
					</div>
					<CardFooter className='justify-between items-center'>
						{(session.total_items ?? 0) > 0 && (
							<span>
								{session.total_items} {session.total_items === 1 ? 'purchased item' : 'purchased items'}
							</span>
						)}
						<div className='flex items-center text-sm text-primary transition-colors'>
							<span>View details</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className='h-4 w-4 transition-transform group-hover:translate-x-1'
							/>
						</div>
					</CardFooter>
				</CardContent>
			</Link>
		</Card>
	)
}
