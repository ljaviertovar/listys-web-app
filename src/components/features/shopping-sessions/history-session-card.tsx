'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar03Icon, DollarCircleIcon, ShoppingCart02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils/format-date'

interface Session {
	id: string
	name: string
	status: string | null
	started_at: string | null
	completed_at: string | null
	total_amount: number | null
	base_list: { name: string } | null
}

interface Props {
	session: Session
}

export function HistorySessionCard({ session }: Props) {
	const completedDate = session.completed_at ? new Date(session.completed_at) : null

	return (
		<Card
			className='hover:border-primary/50 transition-colors cursor-pointer group'
			size='sm'
		>
			<Link href={`/shopping/${session.id}`}>
				<CardHeader className='gap-0'>
					<div className='flex items-center justify-end'>
						<Badge variant='completed'>Completed</Badge>
					</div>
					<div className='flex gap-2 items-center'>
						<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
								className='h-6 w-6 text-primary'
							/>
						</span>
						<div className='flex flex-col'>
							<CardTitle className='text-base md:text-lg truncate w-full max-w-[20ch]'>{session.name}</CardTitle>
						</div>
					</div>
				</CardHeader>
				<CardContent className='pt-4'>
					<div className='space-y-2 mb-4'>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<HugeiconsIcon
								icon={Calendar03Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
							{completedDate ? `${formatDate(completedDate)} - ${formatTime(completedDate)}` : 'Date unknown'}
						</div>
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
					<div className='flex items-center justify-end'>
						<div className='flex items-center text-sm text-primary transition-colors'>
							<span>View Details</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className='h-4 w-4 transition-transform group-hover:translate-x-1'
							/>
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	)
}
