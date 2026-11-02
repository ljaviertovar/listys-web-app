'use client'

import { useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'

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

	const handleChange = (next: string) => {
		router.replace(next === ALL_STORES ? pathname : `${pathname}?store=${encodeURIComponent(next)}`, { scroll: false })
	}

	return (
		<div
			data-testid='usual-store-filter'
			className='flex flex-col gap-2'
		>
			<Label htmlFor={labelId}>Show items from</Label>
			<Select
				value={value ?? ALL_STORES}
				onValueChange={handleChange}
			>
				<SelectTrigger id={labelId}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_STORES}>All Stores · {totalCount} {totalCount === 1 ? 'item' : 'items'}</SelectItem>
					{options.map(option => (
						<SelectItem
							key={option.value}
							value={option.value}
						>
							{option.label} · {option.count} {option.count === 1 ? 'item' : 'items'}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
