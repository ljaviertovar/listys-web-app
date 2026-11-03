'use client'

import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/utils'

export interface ChoiceOption {
	value: string
	label: string
	/** A short fact at the end of the row, in mono ("3 receipts", "New store"). */
	detail?: string
	/** A second line under the label, for what tells two similar rows apart or why a row cannot be chosen. */
	note?: string
	/** The row stays listed but cannot be chosen. */
	disabled?: boolean
}

interface SearchableChoiceListProps {
	searchLabel: string
	placeholder?: string
	query: string
	onQueryChange: (query: string) => void
	options: ChoiceOption[]
	value: string
	onValueChange: (value: string) => void
	/** Announced politely above the rows: how many match, or why there are none. */
	status: string
	disabled?: boolean
	testId: string
}

/**
 * Picks one option from a list filtered by a search field, inside a sheet. The rows are a radio group instead of a floating
 * combobox because a popup opened from a modal sheet fights its focus trap; the list scrolls inside the sheet.
 */
export function SearchableChoiceList({
	searchLabel,
	placeholder,
	query,
	onQueryChange,
	options,
	value,
	onValueChange,
	status,
	disabled = false,
	testId,
}: SearchableChoiceListProps) {
	const searchId = useId()
	const statusId = useId()

	return (
		<div
			data-testid={testId}
			className='flex flex-col gap-3'
		>
			<div className='flex flex-col gap-2'>
				<Label htmlFor={searchId}>{searchLabel}</Label>
				<Input
					id={searchId}
					type='search'
					size='lg'
					autoComplete='off'
					maxLength={100}
					value={query}
					onChange={event => onQueryChange(event.target.value)}
					placeholder={placeholder}
					disabled={disabled}
				/>
			</div>
			<p
				id={statusId}
				aria-live='polite'
				className='text-xs text-slate-500 dark:text-muted-foreground'
			>
				{status}
			</p>
			{options.length > 0 ? (
				<div className='max-h-72 overflow-y-auto'>
					<RadioGroup
						value={value}
						onValueChange={onValueChange}
						aria-labelledby={statusId}
						disabled={disabled}
					>
						{options.map(option => (
							<ChoiceRow
								key={option.value}
								option={option}
							/>
						))}
					</RadioGroup>
				</div>
			) : null}
		</div>
	)
}

interface ChoiceRowProps {
	option: ChoiceOption
}

/** One radio row of a choice list; also used on its own by lists that do not need the search field. */
export function ChoiceRow({ option }: ChoiceRowProps) {
	const id = useId()
	return (
		<label
			htmlFor={id}
			data-testid='choice-option'
			data-disabled={option.disabled ? '' : undefined}
			className={cn(
				'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2',
				option.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted has-data-[state=checked]:bg-accent',
			)}
		>
			<RadioGroupItem
				id={id}
				value={option.value}
				disabled={option.disabled}
			/>
			<span className='flex min-w-0 flex-1 flex-col'>
				<span className='break-words text-sm font-medium'>{option.label}</span>
				{option.note ? <span className='break-words text-xs text-slate-500 dark:text-muted-foreground'>{option.note}</span> : null}
			</span>
			{option.detail ? (
				<span className='shrink-0 font-mono text-xs text-slate-500 tabular-nums dark:text-muted-foreground'>{option.detail}</span>
			) : null}
		</label>
	)
}
