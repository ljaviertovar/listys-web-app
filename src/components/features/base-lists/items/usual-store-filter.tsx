'use client'

import { useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Store03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Label } from '@/components/ui/label'
import { RowIcon } from '@/components/commons'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'

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
	const storeFilterAnchor = useComboboxAnchor()
	const handleChange = (next: string) => {
		router.replace(next === ALL_STORES ? pathname : `${pathname}?store=${encodeURIComponent(next)}`, { scroll: false })
	}
	const comboboxOptions = [{ value: ALL_STORES, label: 'All Stores', count: totalCount }, ...options]

	return (
		<div
			data-testid='usual-store-filter'
			className='flex flex-col gap-2'
		>
			<Label htmlFor={labelId}>Show items from:</Label>
			<Combobox
				items={comboboxOptions.map(option => option.value)}
				itemToStringLabel={next => {
					const option = comboboxOptions.find(candidate => candidate.value === next)
					return option ? `${option.label} · ${option.count} ${option.count === 1 ? 'item' : 'items'}` : ''
				}}
				filter={(item, query, getLabel) => (getLabel?.(item) ?? String(item)).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
				value={value ?? ALL_STORES}
				onValueChange={next => typeof next === 'string' && handleChange(next)}
			>
				<div className='w-full' ref={storeFilterAnchor}>
				<ComboboxInput
					id={labelId}
					size='filter'
					surface='page'
					inset='card'
					aria-label='Show items from'
					data-testid='usual-store-filter-control'
				>
					<InputGroupAddon align='inline-start'>
						<span
							aria-hidden='true'
							className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
						>
							<HugeiconsIcon icon={Store03Icon} strokeWidth={1.8} className='size-4' />
						</span>
					</InputGroupAddon>
				</ComboboxInput>
				</div>
				<ComboboxContent size='filter' placement='below' anchor={storeFilterAnchor}>
					<ComboboxList>
						{(next: string) => {
							const option = comboboxOptions.find(candidate => candidate.value === next)
							if (!option) return null
							return (
								<ComboboxItem key={option.value} value={option.value} size='filter'>
									<RowIcon icon={Store03Icon} tone='store' size='xs' testId={`usual-store-filter-option-icon-${option.value}`} />
							<span className='flex min-w-0 flex-1 items-center justify-between gap-3'>
								<span className='truncate'>{option.label}</span>
								<span className='font-mono text-xs tabular-nums text-muted-foreground'>{option.count}</span>
							</span>
								</ComboboxItem>
							)
						}}
					</ComboboxList>
					<ComboboxEmpty>No stores match this search.</ComboboxEmpty>
				</ComboboxContent>
			</Combobox>
		</div>
	)
}
