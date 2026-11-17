'use client'

import { useId, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '@/components/ui/field'

export interface ChoiceOption {
	value: string
	label: string
	/** A short fact at the end of the row, in mono ("3 receipts", "New store"). */
	detail?: ReactNode
	/** Reduces the emphasis of secondary facts such as counts. */
	detailTone?: 'default' | 'muted'
	/** A second line under the label, for what tells two similar rows apart or why a row cannot be chosen. */
	note?: ReactNode
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
	searchable?: boolean
	/** Lets the options list fill a bounded flex region above a sheet footer. */
	fillAvailableHeight?: boolean
	/** `card` is the sheet picker of the canvas: option cards, the search field named only for assistive tech, and the count announced but not drawn. */
	variant?: 'default' | 'card'
	statusVisibility?: 'sr-only' | 'visible'
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
	searchable = true,
	fillAvailableHeight = false,
	variant = 'default',
	statusVisibility,
	testId,
}: SearchableChoiceListProps) {
	const searchId = useId()
	const statusId = useId()

	return (
		<div
			data-testid={testId}
			className={fillAvailableHeight ? 'flex min-h-0 flex-1 flex-col gap-4 overflow-hidden' : variant === 'card' ? 'flex flex-col gap-4' : 'flex flex-col gap-3'}
		>
			{searchable ? (
				<div className='flex flex-col gap-2'>
					<Label htmlFor={searchId} className={variant === 'card' ? 'sr-only' : undefined}>{searchLabel}</Label>
					<div className='relative'>
						{showSearchIcon || variant === 'card' ? <HugeiconsIcon icon={Search01Icon} className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' aria-hidden='true' /> : null}
						<Input
							id={searchId}
							type='search'
							size='lg'
							adornment={showSearchIcon || variant === 'card' ? 'start' : 'none'}
							autoComplete='off'
							maxLength={100}
							value={query}
							onChange={event => onQueryChange(event.target.value)}
							placeholder={placeholder}
							disabled={disabled}
						/>
					</div>
				</div>
			) : null}
			<p
				id={statusId}
				aria-live='polite'
				className={statusVisibility === 'visible' || (statusVisibility !== 'sr-only' && variant !== 'card') ? 'text-xs text-muted-foreground dark:text-muted-foreground' : 'sr-only'}
			>
				{status}
			</p>
			{options.length > 0 ? (
				<ScrollArea
					size={fillAvailableHeight ? 'default' : 'sheet-fit'}
					className={fillAvailableHeight ? 'min-h-0 flex-1' : 'max-h-72'}
				>
					<RadioGroup
						spacing={variant === 'card' ? 'compact' : 'default'}
						value={value}
						onValueChange={onValueChange}
						aria-labelledby={statusId}
						disabled={disabled}
					>
						{options.map(option => (
							<ChoiceRow
								key={option.value}
								option={option}
								selected={value === option.value}
								variant={variant === 'card' ? 'card' : 'default'}
							/>
						))}
					</RadioGroup>
				</ScrollArea>
			) : null}
		</div>
	)
}

interface ChoiceRowProps {
	option: ChoiceOption
	variant?: 'default' | 'card'
	selected?: boolean
	testId?: string
}

/** One radio row of a choice list; also used on its own by lists that do not need the search field. */
export function ChoiceRow({ option, variant = 'default', selected = false, testId = `choice-${option.value}` }: ChoiceRowProps) {
	const id = useId()
    return (
        <FieldLabel htmlFor={id} variant={variant === 'card' ? 'card' : 'default'} data-testid={testId} data-selected={selected ? 'true' : undefined} data-disabled={option.disabled ? '' : undefined}>
            <Field orientation='horizontal' align={variant === 'card' ? 'center' : 'default'} data-disabled={option.disabled} data-variant={variant}>
                <RadioGroupItem id={id} value={option.value} size={variant === 'card' ? 'choice' : 'default'} disabled={option.disabled} />
                <FieldContent size={variant === 'card' ? 'compact' : 'default'}>
                    <FieldTitle size={variant === 'card' ? 'choice' : 'default'}>{option.label}</FieldTitle>
                    {option.note ? <FieldDescription size={variant === 'card' ? 'choice' : 'default'}>{option.note}</FieldDescription> : null}
                </FieldContent>
				{option.detail ? <span className={`shrink-0 font-mono text-xs tabular-nums ${option.detailTone === 'muted' ? 'text-muted-foreground' : ''}`}>{option.detail}</span> : null}
            </Field>
        </FieldLabel>
    )
}
