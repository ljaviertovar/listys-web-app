import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'

import { cn } from '@/utils'

import { getCategoryIcon, getCategoryTone } from './helpers/category-style'

interface CategoryHeadingProps {
	/** Normalised category name; it picks the icon and its colour. */
	category: string
	/** Text of the heading; defaults to the category name. */
	title?: string
	/** Count shown at the right ("3 items", "1/2"). */
	count: ReactNode
	/** Turns the count green once everything in the category is done (a shopping session). */
	complete?: boolean
	testId: string
}

/**
 * The category's grey tile with its coloured icon, its name as a caption in capitals and a mono count. It adds no box of its
 * own (`contents`), so it lays out as three items of the row that holds it: the trigger of a folding section, or the plain
 * caption above the rows of a category.
 */
export function CategoryHeading({ category, title = category, count, complete = false, testId }: CategoryHeadingProps) {
	return (
		<span data-testid={testId} className='contents'>
			<span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary dark:bg-muted'>
				<HugeiconsIcon
					icon={getCategoryIcon(category)}
					strokeWidth={1.5}
					aria-hidden='true'
					className={cn('size-4.5', getCategoryTone(category))}
				/>
			</span>
			<span className='min-w-0 flex-1 truncate font-sans text-xs leading-[1.25] font-semibold tracking-[0.04em] text-slate-700 uppercase dark:text-foreground/80'>
				{title}
			</span>
			<span
				className={cn(
					'font-mono text-xs tabular-nums',
					complete ? 'font-semibold text-green-700 dark:text-green-400' : 'font-medium text-slate-500 dark:text-muted-foreground',
				)}
			>
				{count}
			</span>
		</span>
	)
}
