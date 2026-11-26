import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ActiveShoppingBadge } from '@/components/app/active-session'
import { CollaboratorAvatars } from '@/components/features/sharing'
import { Card } from '@/components/ui/card'

import { ItemsPanel, TripRowMock } from './trip-row-mock'

const COLLABORATORS = [
	{ initials: 'MY', display_name: 'Maya' },
	{ initials: 'NH', display_name: 'Noah' },
	{ initials: 'AV', display_name: 'Ava' },
]

type SharedTripMockProps = {
	testId: string
}

/** The shared trip of "Pantry" as one person sees it: the same checked row shows on every phone of the household. */
export function SharedTripMock({ testId }: SharedTripMockProps) {
	return (
		<div
			data-testid={testId}
			className='rounded-3xl bg-muted p-3 shadow-xl ring-1 ring-foreground/5'
		>
			<div className='flex items-center justify-between gap-2.5'>
				<b className='font-display text-[19px] font-extrabold tracking-tight text-foreground'>Items for Pantry</b>
				<ActiveShoppingBadge />
			</div>
			<div className='mt-1 mb-2.5 flex items-center gap-2.5 text-[12.5px] text-muted-foreground'>
				<span className='inline-flex items-center gap-1'>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={2}
						className='size-3'
					/>
					Saved
				</span>
				<CollaboratorAvatars
					collaborators={COLLABORATORS}
					size='default'
					className='ml-auto'
				/>
			</div>
			<Card size='tight'>
				<ItemsPanel testId={`${testId}-rows`}>
					<TripRowMock
						quantity={1}
						unit='L'
						name='Almond milk'
						price={4.5}
						checkbox='checked'
						testId={`${testId}-almond-milk`}
					/>
					<TripRowMock
						quantity={4}
						unit='unit'
						name='Lemons'
						note='Unwaxed ones, they’re for Maya’s lemonade'
						price={0.45}
						testId={`${testId}-lemons`}
					/>
				</ItemsPanel>
			</Card>
		</div>
	)
}
