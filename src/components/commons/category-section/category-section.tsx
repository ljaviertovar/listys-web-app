'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FOCUS_RING } from '@/components/app/helpers/a1-surface'
import { cn } from '@/utils'

import { getCategoryIcon, getCategoryTone } from './helpers/category-style'

interface CategorySectionProps {
	/** Normalised category name; it picks the icon and its colour. */
	category: string
	/** Text of the heading; defaults to the category name. */
	title?: string
	/** Count shown at the right of the heading ("3 items", "1/2"). */
	count: ReactNode
	/** Turns the count green once everything in the category is done (a shopping session). */
	complete?: boolean
	defaultOpen?: boolean
	children: ReactNode
	testId: string
	/** Classes of the surface that holds the rows. */
	panelClassName?: string
	/** Classes of the section itself, for example to drop its top divider when it opens a card. */
	className?: string
}

/**
 * A category that folds away, the way the receipt and every list shows its items: a grey tile with the category's
 * coloured icon, its name as a caption in capitals, a mono count and a chevron, and the rows on a soft surface below.
 */
export function CategorySection({
	category,
	title = category,
	count,
	complete = false,
	defaultOpen = true,
	children,
	testId,
	panelClassName,
	className,
}: CategorySectionProps) {
	return (
		<Collapsible
			defaultOpen={defaultOpen}
			data-testid={testId}
			className={cn(
				'group/category border-t border-slate-100 pb-0 data-[state=open]:pb-2.5 dark:border-border',
				className,
			)}
		>
			<h3 className='m-0'>
				<CollapsibleTrigger
					className={cn('flex min-h-[52px] w-full items-center gap-3 rounded-[12px] text-left', FOCUS_RING)}
				>
					<span className='flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF1F5] dark:bg-muted'>
						<HugeiconsIcon
							icon={getCategoryIcon(category)}
							strokeWidth={1.5}
							aria-hidden='true'
							className={cn('size-[18px]', getCategoryTone(category))}
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
					<span
						aria-hidden='true'
						className='flex size-9 items-center justify-center text-slate-500'
					>
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							strokeWidth={1.8}
							className='size-[18px] transition-transform group-data-[state=closed]/category:-rotate-90 motion-reduce:transition-none'
						/>
					</span>
				</CollapsibleTrigger>
			</h3>
			<CollapsibleContent>
				<div className={cn('overflow-hidden rounded-2xl bg-[#F6F7F9] dark:bg-muted/50', panelClassName)}>{children}</div>
			</CollapsibleContent>
		</Collapsible>
	)
}
