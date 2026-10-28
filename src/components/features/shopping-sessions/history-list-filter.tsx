'use client'

import { useId } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
			<Label htmlFor={fieldId}>Show trips from</Label>
			<Select
				value={selectedListId ?? ALL_LISTS}
				onValueChange={handleChange}
			>
				<SelectTrigger
					id={fieldId}
					size='lg'
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_LISTS}>All lists</SelectItem>
					{options.map(option => (
						<SelectItem
							key={option.id}
							value={option.id}
						>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
