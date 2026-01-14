'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar03Icon, DollarCircleIcon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { formatDate } from '@/utils/format-date'

interface Run {
	id: string
	name: string
	status: string
	started_at: string
	completed_at: string | null
	total_amount: number | null
	base_list: { name: string } | null
}

interface Props {
	run: Run
}

export function HistoryRunCard({ run }: Props) {
	const completedDate = run.completed_at ? new Date(run.completed_at) : null

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span className='flex items-center gap-2'>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={2}
						/>
						{run.name}
					</span>
					<Badge variant='secondary'>Completed</Badge>
				</CardTitle>
				{run.base_list && <CardDescription>From: {run.base_list.name}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-between'>
					<div className='space-y-2'>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<HugeiconsIcon
								icon={Calendar03Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
							{completedDate ? formatDate(completedDate) : 'Date unknown'}
						</div>
						{run.total_amount && (
							<div className='flex items-center gap-2 text-sm font-medium'>
								<HugeiconsIcon
									icon={DollarCircleIcon}
									strokeWidth={2}
									className='h-4 w-4'
								/>
								${run.total_amount.toFixed(2)}
							</div>
						)}
					</div>

					<Button
						asChild
						variant='outline'
					>
						<Link href={`/shopping/${run.id}`}>View Details</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
