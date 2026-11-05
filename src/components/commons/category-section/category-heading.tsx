import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

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
	icon?: IconSvgElement
	tone?: 'primary' | 'success' | 'warning' | 'muted'
	description?: string
}

/**
 * The category's grey tile with its coloured icon, its name as a caption in capitals and a mono count. It adds no box of its
 * own (`contents`), so it lays out as three items of the row that holds it: the trigger of a folding section, or the plain
 * caption above the rows of a category.
 */
export function CategoryHeading({ category, title = category, count, complete = false, testId, icon, tone, description }: CategoryHeadingProps) {
	return (
		<span data-testid={testId} className='contents'>
			<span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary dark:bg-muted', description && 'self-start mt-1', tone === 'primary' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', tone === 'success' && 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', tone === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300')}>
				<HugeiconsIcon
					icon={icon ?? getCategoryIcon(category)}
					strokeWidth={1.5}
					aria-hidden='true'
					className={cn('size-4.5', !tone && getCategoryTone(category), tone === 'muted' && 'text-slate-500')}
				/>
			</span>
			<span className={cn('min-w-0 flex-1', description && 'py-3')}>
				<span className='block font-sans text-xs leading-[1.25] font-semibold tracking-[0.04em] text-slate-700 uppercase dark:text-foreground/80'>{title}</span>
				{description ? <span className='mt-2 block text-xs leading-normal font-normal text-slate-500 normal-case dark:text-muted-foreground'>{description}</span> : null}
			</span>
			<span
				className={cn(
					'font-mono text-xs tabular-nums',
					description && 'self-start mt-3',
					complete ? 'font-semibold text-green-700 dark:text-green-400' : 'font-medium text-slate-500 dark:text-muted-foreground',
				)}
			>
				{count}
			</span>
		</span>
	)
}
