'use client'

import { useId } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ListViewIcon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Label } from '@/components/ui/label'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, useComboboxAnchor } from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'

import type { HistoryFilterOption } from './helpers/build-history-view'
import { ALL_LISTS, historyFilterHref } from './helpers/history-filter-href'

interface Props {
	options: HistoryFilterOption[]
	/** The list the history is narrowed to, or null for every trip. */
	selectedListId: string | null
	testId?: string
}

/** Narrows the shopping history to one list. The choice lives in the URL (`?list=`), so it survives a reload and can be shared. */
export function HistoryListFilter({ options, selectedListId, testId = 'history-list-filter' }: Props) {
	const fieldId = useId()
	const listFilterAnchor = useComboboxAnchor()
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const comboboxOptions = [{ value: ALL_LISTS, label: 'All lists' }, ...options.map(option => ({ value: option.id, label: option.name }))]

	const handleChange = (value: string) => router.push(historyFilterHref(pathname, searchParams.toString(), value))

	return (
		<div
			data-testid={testId}
			className='flex flex-col gap-2 sm:max-w-sm'
		>
			<Label htmlFor={fieldId}>Show trips from:</Label>
			<Combobox
				items={comboboxOptions.map(option => option.value)}
				itemToStringLabel={value => comboboxOptions.find(option => option.value === value)?.label ?? ''}
				value={selectedListId ?? ALL_LISTS}
				onValueChange={value => typeof value === 'string' && handleChange(value)}
			>
				<div className='w-full' ref={listFilterAnchor}>
				<ComboboxInput
					id={fieldId}
					size='filter'
					surface='page'
					inset='card'
					aria-label='Show trips from'
				>
					<InputGroupAddon align='inline-start'>
						<RowIcon icon={ListViewIcon} tone='primary' size='stat' testId='history-filter-input-icon' />
					</InputGroupAddon>
				</ComboboxInput>
				</div>
				<ComboboxContent size='filter' placement='below' anchor={listFilterAnchor}>
					<ComboboxList>
						{(value: string) => {
							const option = comboboxOptions.find(candidate => candidate.value === value)
							if (!option) return null
							return <ComboboxItem key={option.value} value={option.value} size='filter'><ListOption name={option.label} /></ComboboxItem>
						}}
					</ComboboxList>
					<ComboboxEmpty>No lists available.</ComboboxEmpty>
				</ComboboxContent>
			</Combobox>
		</div>
	)
}

/** The list in the filter, with the tile the canvas draws before its name; it is also what the closed trigger shows. */
function ListOption({ name }: { name: string }) {
	return (
		<>
			<RowIcon
				icon={ListViewIcon}
				tone='primary'
				size='stat'
				testId='history-filter-option-icon'
			/>
			{name}
		</>
	)
}