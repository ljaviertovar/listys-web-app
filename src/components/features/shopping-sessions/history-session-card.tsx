'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { DollarCircleIcon, ShoppingCart02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate, formatTime } from '@/utils/format-date'
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
				className='group relative flex h-full cursor-pointer flex-col bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 gap-0 py-4'
				data-testid={`history-card-${session.id}`}
			>
				<CardHeaderContent
					icon={ShoppingCart02Icon}
					title={session.name}
					description={`Shopping: ${completedDate ? `${formatDate(completedDate)} - ${formatTime(completedDate)}` : 'Date unknown'}`}
				/>

				<CardContent className='flex flex-row items-center px-4'>
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
