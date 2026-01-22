'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TicketsFilterProps {
	currentFilter: string
	orphanedCount: number
}

export function TicketsFilter({ currentFilter, orphanedCount }: TicketsFilterProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const setFilter = (filter: string) => {
		const params = new URLSearchParams(searchParams.toString())
		if (filter === 'all') {
			params.delete('filter')
		} else {
			params.set('filter', filter)
		}
		router.push(`?${params.toString()}`)
	}

	return (
		<div className='flex items-center gap-2'>
			<span className='text-sm text-muted-foreground'>Filter:</span>
			<div className='flex gap-2'>
				<Button
					variant={currentFilter === 'all' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setFilter('all')}
				>
					All
				</Button>
				<Button
					variant={currentFilter === 'grouped' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setFilter('grouped')}
				>
					With Group
				</Button>
				<Button
					variant={currentFilter === 'orphaned' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setFilter('orphaned')}
					className='relative'
				>
					No Group
					{orphanedCount > 0 && (
						<Badge
							variant='secondary'
							className='ml-2 h-5 min-w-5 rounded-full bg-amber-500 px-1.5 text-xs text-white'
						>
							{orphanedCount}
						</Badge>
					)}
				</Button>
			</div>
		</div>
	)
}
