'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { formatCurrency } from '@/utils/format-currency'
import type { TicketItem } from '@/features/tickets/types'

interface Props {
	ticketId: string
	items: TicketItem[]
	status: string
}

export function TicketItemsList({ ticketId, items, status }: Props) {
	const router = useRouter()

	// Auto-refresh while processing
	useEffect(() => {
		if (status === 'processing' || status === 'pending') {
			const timer = setTimeout(() => {
				router.refresh()
			}, 3000)

			return () => clearTimeout(timer)
		}
	}, [status, router])

	if (status === 'pending' || status === 'processing') {
		return (
			<div className='flex flex-col items-center justify-center py-12'>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='h-12 w-12 animate-spin text-primary'
				/>
				<p className='mt-4 text-sm text-muted-foreground'>
					{status === 'pending' ? 'Waiting to process...' : 'Extracting items from receipt...'}
				</p>
			</div>
		)
	}

	if (status === 'failed') {
		return (
			<div className='py-8 text-center'>
				<p className='text-sm text-destructive'>Failed to extract items from this receipt.</p>
				<p className='mt-2 text-sm text-muted-foreground'>
					Try uploading a clearer image or contact support if the issue persists.
				</p>
			</div>
		)
	}

	if (items.length === 0) {
		return (
			<div className='py-8 text-center'>
				<p className='text-sm text-muted-foreground'>No items were found in this receipt.</p>
			</div>
		)
	}

	const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				{items.map(item => (
					<div
						key={item.id}
						className='flex items-center justify-between rounded-lg border p-3'
					>
						<div className='flex-1'>
							<p className='font-medium'>{item.name}</p>
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<span>
									{item.quantity || 1} {item.unit || 'pcs'}
								</span>
								{item.category && (
									<>
										<span>•</span>
										<span>{item.category}</span>
									</>
								)}
							</div>
						</div>
						{item.price && <p className='font-medium'>{formatCurrency(item.price)}</p>}
					</div>
				))}
			</div>

			{totalAmount > 0 && (
				<div className='flex items-center justify-between border-t pt-4'>
					<span className='font-semibold'>Total</span>
					<span className='text-lg font-bold'>{formatCurrency(totalAmount)}</span>
				</div>
			)}

			<div className='flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950/20 dark:text-green-400'>
				<HugeiconsIcon
					icon={CheckmarkCircle02Icon}
					strokeWidth={2}
					className='h-5 w-5'
				/>
				<span className='text-sm'>Items extracted successfully</span>
			</div>
		</div>
	)
}
