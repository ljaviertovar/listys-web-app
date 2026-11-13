'use client'

import { useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Store03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { StoreFilterOption } from './helpers/filter-items-by-store'

const ALL_STORES = 'all'

interface UsualStoreFilterProps {
	options: StoreFilterOption[]
	/** The store the list is narrowed to now, or null for every item. */
	value: string | null
	totalCount: number
}

/** "Show items from": narrows a list to the items of one usual store. The choice lives in the URL (`?store=`), so it survives a refresh. */
export function UsualStoreFilter({ options, value, totalCount }: UsualStoreFilterProps) {
	const router = useRouter()
	const pathname = usePathname()
	const labelId = useId()
	const selectedOption = options.find(option => option.value === value)
	const selectedCount = selectedOption?.count ?? totalCount

	const handleChange = (next: string) => {
		router.replace(next === ALL_STORES ? pathname : `${pathname}?store=${encodeURIComponent(next)}`, { scroll: false })
	}

	return (
		<div
			data-testid='usual-store-filter'
			className='flex flex-col gap-2'
		>
			<Label htmlFor={labelId}>Show items from:</Label>
			<Select
				value={value ?? ALL_STORES}
				onValueChange={handleChange}
			>
				<SelectTrigger
					id={labelId}
					size='filter'
				>
					<span className='flex min-w-0 flex-1 items-center gap-2.5'>
						<span
							aria-hidden='true'
							className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
						>
							<HugeiconsIcon
								icon={Store03Icon}
								strokeWidth={1.8}
								className='size-4'
							/>
						</span>
						<span className='min-w-0 flex-1 truncate text-left'>
							<SelectValue>{selectedOption?.label ?? 'All Stores'}</SelectValue>
						</span>
					</span>
					<span className='shrink-0 font-mono text-xs font-medium tabular-nums text-muted-foreground'>
						{selectedCount} {selectedCount === 1 ? 'item' : 'items'}
					</span>
				</SelectTrigger>
				<SelectContent size='filter'>
					<SelectItem
						value={ALL_STORES}
						size='filter'
					>
						All Stores
					</SelectItem>
					{options.map(option => (
						<SelectItem
							key={option.value}
							value={option.value}
							size='filter'
						>
							<span className='flex min-w-0 flex-1 items-center justify-between gap-3'>
								<span className='truncate'>{option.label}</span>
								<span className='font-mono text-xs tabular-nums text-muted-foreground'>{option.count}</span>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
