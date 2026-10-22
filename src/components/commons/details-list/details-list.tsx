import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

export interface DetailsListItem {
	label: string
	value: ReactNode
	icon?: IconSvgElement
}

interface DetailsListProps {
	items: DetailsListItem[]
	testId: string
}

/** A semantic label/value list for read-only profile and account details. */
export function DetailsList({ items, testId }: DetailsListProps) {
	return (
		<dl data-testid={testId} className='divide-y divide-border'>
			{items.map(({ label, value, icon }) => (
				<div key={label} className='flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
					<dt className='flex items-center gap-2 text-sm text-muted-foreground'>
						{icon ? <HugeiconsIcon icon={icon} strokeWidth={2} aria-hidden='true' className='size-4 shrink-0' /> : null}
						{label}
					</dt>
					<dd className='min-w-0 break-words text-sm font-medium sm:text-right'>{value}</dd>
				</div>
			))}
		</dl>
	)
}
