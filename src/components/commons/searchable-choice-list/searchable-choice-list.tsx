'use client'

import { useId } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'

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
	showSearchIcon?: boolean
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
	showSearchIcon = false,
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
				<div className='relative'>
					{showSearchIcon ? <HugeiconsIcon icon={Search01Icon} className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' /> : null}
					<Input
						id={searchId}
						type='search'
						size='lg'
						adornment={showSearchIcon ? 'start' : 'none'}
						autoComplete='off'
						maxLength={100}
						value={query}
						onChange={event => onQueryChange(event.target.value)}
						placeholder={placeholder}
						disabled={disabled}
					/>
				</div>
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
	variant?: 'default' | 'card'
	testId?: string
}

/** One radio row of a choice list; also used on its own by lists that do not need the search field. */
export function ChoiceRow({ option, variant = 'default', testId = `choice-${option.value}` }: ChoiceRowProps) {
	const id = useId()
	return (
		<label
			htmlFor={id}
			data-testid={testId}
			data-disabled={option.disabled ? '' : undefined}
			className={cn(
				'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2',
				variant === 'card' && 'min-h-14 rounded-2xl border border-slate-200 bg-card px-3.5 py-2 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-blue-50 has-data-[state=checked]:ring-1 has-data-[state=checked]:ring-primary dark:border-border dark:has-data-[state=checked]:bg-blue-500/10',
				option.disabled ? 'cursor-not-allowed opacity-50' : variant === 'card' ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/10' : 'cursor-pointer hover:bg-muted has-data-[state=checked]:bg-accent',
			)}
		>
			<RadioGroupItem
				id={id}
				value={option.value}
				size={variant === 'card' ? 'card' : 'default'}
				disabled={option.disabled}
			/>
			<span className='flex min-w-0 flex-1 flex-col'>
				<span className={cn('break-words text-sm', variant === 'card' ? 'font-semibold' : 'font-medium')}>{option.label}</span>
				{option.note ? <span className='break-words text-xs text-slate-500 dark:text-muted-foreground'>{option.note}</span> : null}
			</span>
			{option.detail ? (
				<span className='shrink-0 font-mono text-xs text-slate-500 tabular-nums dark:text-muted-foreground'>{option.detail}</span>
			) : null}
		</label>
	)
}
