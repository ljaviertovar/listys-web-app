import type { ReactNode } from 'react'

import { ShoppingSessionItemRowView } from '@/components/features/shopping-sessions'

export type TripRowMockData = {
	quantity: number
	unit: string
	name: string
	note?: string
	/** The usual store, drawn as the app's store label. */
	store?: string
	/** "also at No Frills". */
	alsoAt?: string
	price?: number
}

type TripRowMockProps = TripRowMockData & {
	/** `none` draws the row of a finished trip (receipt price, no checkbox), as the band's list side. */
	checkbox?: 'none' | 'unchecked' | 'checked'
	testId: string
}

/** A trip row for the landing's product pictures: the app's own ShoppingSessionItemRowView fed with fixed data. */
export function TripRowMock({ quantity, unit, name, note, store, alsoAt, price, checkbox = 'unchecked', testId }: TripRowMockProps) {
	const completed = checkbox === 'none'

	return (
		<ShoppingSessionItemRowView
			id={testId}
			name={name}
			quantity={quantity}
			unit={unit}
			notes={note}
			isCompleted={completed}
			checked={checkbox === 'checked'}
			price={completed ? price : null}
			averagePrice={completed ? null : price}
			store={store ? { name: store, kind: completed ? 'purchase-store' : 'usual-store' } : null}
			alsoAt={alsoAt}
		/>
	)
}

type ItemsPanelProps = {
	children: ReactNode
	testId: string
}

/** The muted, rounded panel that holds a run of trip rows, with a hairline between them. */
export function ItemsPanel({ children, testId }: ItemsPanelProps) {
	return (
		<div
			data-testid={testId}
			className='flex flex-col divide-y divide-border rounded-2xl bg-muted'
		>
			{children}
		</div>
	)
}
