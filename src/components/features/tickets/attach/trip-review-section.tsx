import { Add01Icon, MinusSignIcon, Tick02Icon, TickDouble02Icon } from '@hugeicons/core-free-icons'

import { CategorySection } from '@/components/commons'
import { ItemQuantityChip } from '@/components/features/list-items'
import { formatItemName } from '@/utils'

import type { AttachReviewLine } from './helpers/build-attach-review'
import type { ReviewSessionItem } from './helpers/plan-quantity-change'
import { TRIP_REVIEW_COPY } from './trip-review-copy'
import { TripReviewLineRow } from './trip-review-line-row'

export function TripReviewSection({
	id,
	listName,
	lines = [],
	items = [],
	onChange,
}: {
	id: keyof typeof TRIP_REVIEW_COPY.sections
	listName: string
	lines?: AttachReviewLine[]
	items?: ReviewSessionItem[]
	onChange: (id: string) => void
}) {
	const count = lines.length + items.length
	if (!count) return null
	const copy = TRIP_REVIEW_COPY.sections[id]
	return (
		<CategorySection
			category='Other'
			title={copy.title(listName)}
			description={copy.help(listName)}
			count={count}
			icon={
				id === 'new'
					? Add01Icon
					: id === 'will-be-checked' || id === 'already-checked'
						? TickDouble02Icon
						: MinusSignIcon
			}
			tone={id === 'new' || id === 'will-be-checked' ? 'primary' : id === 'already-checked' ? 'success' : 'muted'}
			defaultOpen={id !== 'not-checked-not-on-receipt'}
			testId={`attach-review-section-${id}`}
		>
			<div className='divide-y divide-slate-200 dark:divide-border'>
				{lines.map(line => (
					<TripReviewLineRow
						key={line.id}
						line={line}
						onChange={onChange}
					/>
				))}
				{items.map(item => (
					<div
						key={item.id}
						data-testid={`attach-review-missing-${item.id}`}
						className='flex min-h-14 items-center gap-2 px-3 py-3'
					>
						<ItemQuantityChip
							quantity={item.quantity}
							unit={item.unit}
						/>
						<span className='truncate text-sm font-semibold'>{formatItemName(item.name)}</span>
					</div>
				))}
			</div>
		</CategorySection>
	)
}
