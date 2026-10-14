'use client'

import { Card, CardContent } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import { DollarCircleIcon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils'
import { CardFooterContent, CardHeaderContent } from '@/components/app'

interface Session {
	id: string
	name: string
	status: string | null
	started_at: string | null
	completed_at: string | null
	total_amount: number | null
	total_items?: number | null
	purchased_count?: number | null
	shopping_session_items?: Array<{ id: string; checked: boolean | null }> | null
	base_list: { name: string } | null
}

interface Props {
	session: Session
	href?: string
}

export function HistorySessionCard({ session, href }: Props) {
	const completedDate = session.completed_at ? new Date(session.completed_at) : null
	const purchasedCount =
		session.purchased_count ??
		session.shopping_session_items?.filter(i => i.checked === true).length ??
		session.total_items ??
		0

	return (
		<Link href={href ?? `/shopping/${session.id}`}>
			<Card
				variant='premium'
				size='compact'
				className='group relative h-full cursor-pointer'
				data-testid={`history-card-${session.id}`}
			>
				<CardHeaderContent
					icon={ShoppingCart02Icon}
					title={session.name}
					description={`Shopping: ${completedDate ? `${formatDate(completedDate)} - ${formatTime(completedDate)}` : 'Date unknown'}`}
				/>

				<CardContent
				inset='compact'
				className='flex flex-row items-center'
			>
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
				</CardContent>

				<CardFooterContent
					count={purchasedCount}
					coutLabel={purchasedCount === 1 ? 'Purchased Item' : 'Purchased Items'}
					linkText='View Details'
				/>
			</Card>
		</Link>
	)
}
