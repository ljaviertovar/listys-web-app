'use client'

import { useId } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ListViewIcon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const handleChange = (value: string) => router.push(historyFilterHref(pathname, searchParams.toString(), value))

	return (
		<div
			data-testid={testId}
			className='flex flex-col gap-2 sm:max-w-sm'
		>
			<Label htmlFor={fieldId}>Show trips from:</Label>
			<Select
				value={selectedListId ?? ALL_LISTS}
				onValueChange={handleChange}
			>
				<SelectTrigger
					id={fieldId}
					size='filter'
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent size='filter'>
					<SelectItem
						size='filter'
						value={ALL_LISTS}
					>
						<ListOption name='All lists' />
					</SelectItem>
					{options.map(option => (
						<SelectItem
							key={option.id}
							size='filter'
							value={option.id}
						>
							<ListOption name={option.name} />
						</SelectItem>
					))}
				</SelectContent>
			</Select>
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
