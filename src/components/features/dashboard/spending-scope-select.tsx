'use client'

import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from '@/components/ui/combobox'
import type { SpendingScope } from './hooks/use-spending-summary'

const SCOPES: SpendingScope[] = ['month', 'all']
const SCOPE_LABELS: Record<SpendingScope, string> = { month: 'Spend This Month', all: 'Spend All Time' }

interface SpendingScopeSelectProps {
	value: SpendingScope
	onChange: (scope: SpendingScope) => void
	testId: string
}

/** The card's title as a choice: this month (the default) or every receipt the user has. What the card shows follows it. */
export function SpendingScopeSelect({ value, onChange, testId }: SpendingScopeSelectProps) {
	const anchor = useComboboxAnchor()

	return (
		<Combobox
			items={SCOPES}
			itemToStringLabel={scope => SCOPE_LABELS[scope]}
			value={value}
			onValueChange={next => {
				if (next === 'month' || next === 'all') onChange(next)
			}}
		>
			<div
				data-testid={testId}
				className='w-52'
				ref={anchor}
			>
				<ComboboxInput
					size='default'
					surface='form'
					aria-label='Spending period'
					data-testid={`${testId}-control`}
				/>
			</div>
			<ComboboxContent
				anchor={anchor}
				placement='below'
			>
				<ComboboxList>
					{(scope: SpendingScope) => (
						<ComboboxItem
							key={scope}
							value={scope}
							data-testid={`${testId}-option-${scope}`}
						>
							{SCOPE_LABELS[scope]}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
