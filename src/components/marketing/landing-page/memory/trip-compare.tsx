'use client'

import { useState, type ReactNode } from 'react'

import { CategoryHeading } from '@/components/commons'
import { SessionSummaryCard } from '@/components/features/shopping-sessions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils'

import { MonoLabel } from '../commons'
import { ItemsPanel, TripRowMock, type TripRowMockData } from '../mockups'

const FIRST_TRIP: TripRowMockData[] = [
	{ quantity: 1, unit: 'L', name: 'Almond milk' },
	{ quantity: 12, unit: 'unit', name: 'Free-range eggs' },
	{ quantity: 1, unit: 'box', name: 'Organic strawberries' },
	{ quantity: 1, unit: 'unit', name: 'Sourdough bread' },
]

const LATER_TRIP: TripRowMockData[] = [
	{ quantity: 1, unit: 'L', name: 'Almond milk', store: 'Market Fresh', alsoAt: 'also at No Frills', price: 4.5 },
	{ quantity: 12, unit: 'unit', name: 'Free-range eggs', store: 'No Frills', price: 4.8 },
	{ quantity: 1, unit: 'box', name: 'Organic strawberries', store: 'Market Fresh', price: 5.99 },
	{ quantity: 1, unit: 'unit', name: 'Sourdough bread', store: 'Mill Bakery', price: 5.25 },
]

type TripKey = 'first' | 'later'

const TRIPS: { id: TripKey; label: string; caption: string; count: string }[] = [
	{ id: 'first', label: 'Trip 1', caption: 'First receipt', count: '4 items' },
	{ id: 'later', label: 'Trip 4', caption: 'A few receipts later', count: '4 / 4' },
]

/**
 * The same list on its first trip and a few receipts later. From `md` both trips are laid over each other; on a phone a two-option
 * switch shows one at a time, so the section stays short.
 */
export function TripCompare() {
	const [selected, setSelected] = useState<TripKey>('later')

	return (
		<div data-testid='landing-trip-compare'>
			<div
				role='radiogroup'
				aria-label='Compare trips'
				className='grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1 md:hidden'
			>
				{TRIPS.map(trip => (
					<Button
						key={trip.id}
						type='button'
						role='radio'
						aria-checked={selected === trip.id}
						variant='segment'
						size='touch'
						onClick={() => setSelected(trip.id)}
						data-testid={`landing-trip-compare-${trip.id}`}
					>
						{trip.label}
					</Button>
				))}
			</div>

			<div className='relative mt-3.5 grid gap-5 md:mt-0 md:block md:pb-5'>
				<div
					className={cn(
						'md:w-[68%] md:-rotate-[2.5deg] md:opacity-92',
						selected !== 'first' && 'max-md:hidden',
					)}
				>
					<TripLabel {...TRIPS[0]} />
					<TripShot>
						<Card size='tight'>
							<TripGroup
								count='4 items'
								rows={FIRST_TRIP}
								testId='landing-trip-first'
							/>
						</Card>
					</TripShot>
				</div>
				<div
					className={cn(
						'md:relative md:z-10 md:-mt-[118px] md:ml-auto md:flex md:w-[74%] md:flex-col-reverse',
						selected !== 'later' && 'max-md:hidden',
					)}
				>
					<TripLabel
						{...TRIPS[1]}
						below
					/>
					<TripShot>
						<div className='flex flex-col gap-3'>
							<SessionSummaryCard
								mode='active'
								checked={4}
								total={4}
								estimate={{ total: 20.54, pricedCount: 4, itemCount: 4 }}
								testId='landing-trip-later-progress'
							/>
							<Card size='tight'>
								<TripGroup
									count='4/4'
									complete
									rows={LATER_TRIP}
									checked
									testId='landing-trip-later'
								/>
							</Card>
						</div>
					</TripShot>
				</div>
			</div>
		</div>
	)
}

type TripLabelProps = { label: string; caption: string; count: string; below?: boolean }

/** "Trip 1 · First receipt" over a trip on desktop; "First receipt · 4 items" on a phone, where the switch already names the trip. */
function TripLabel({ label, caption, count, below = false }: TripLabelProps) {
	return (
		<div className={cn('mb-2.5 flex items-baseline justify-between gap-2.5 px-1.5', below && 'md:mt-3.5 md:mb-0')}>
			<b className='hidden font-display text-2xl font-extrabold tracking-[-0.03em] text-paper-ink md:block'>{label}</b>
			<MonoLabel>{caption}</MonoLabel>
			<MonoLabel className='md:hidden'>{count}</MonoLabel>
		</div>
	)
}

/** The app's grey page behind a trip's cards. */
function TripShot({ children }: { children: ReactNode }) {
	return (
		<div
			aria-hidden='true'
			inert
			className='rounded-3xl bg-muted p-3 shadow-xl ring-1 ring-foreground/5'
		>
			{children}
		</div>
	)
}

type TripGroupProps = { count: string; complete?: boolean; checked?: boolean; rows: TripRowMockData[]; testId: string }

/** The list's category heading and its rows, checked once the trip is done. */
function TripGroup({ count, complete = false, checked = false, rows, testId }: TripGroupProps) {
	return (
		<div className='flex flex-col gap-1'>
			<div className='flex items-center gap-2.5 px-1 pt-0.5 pb-2'>
				<CategoryHeading
					category='Pantry'
					count={count}
					complete={complete}
					testId={`${testId}-heading`}
				/>
			</div>
			<ItemsPanel testId={`${testId}-rows`}>
				{rows.map(row => (
					<TripRowMock
						key={row.name}
						{...row}
						checkbox={checked ? 'checked' : 'unchecked'}
						testId={`${testId}-${row.name.toLowerCase().replaceAll(' ', '-')}`}
					/>
				))}
			</ItemsPanel>
		</div>
	)
}
