'use client'

import type { ComponentProps, ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/utils'

import { CategoryHeading } from './category-heading'

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
	icon?: ComponentProps<typeof CategoryHeading>['icon']
	tone?: ComponentProps<typeof CategoryHeading>['tone']
	description?: string
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
	icon,
	tone,
	description,
}: CategorySectionProps) {
	return (
		<div className={cn('border-t border-slate-100 dark:border-border', className)}>
			<Collapsible
				defaultOpen={defaultOpen}
				data-testid={testId}
				variant='section'
				className='group/category'
			>
				<h3 className='m-0'>
					<CollapsibleTrigger variant='row'>
						<CategoryHeading
							category={category}
							title={title}
							count={count}
							complete={complete}
							icon={icon}
							tone={tone}
							testId={`${testId}-heading`}
						/>
						<span
							aria-hidden='true'
							className='flex size-9 items-center justify-center text-slate-500'
						>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								strokeWidth={1.8}
								className='size-4.5 transition-transform group-data-[state=closed]/category:-rotate-90 motion-reduce:transition-none'
							/>
						</span>
					</CollapsibleTrigger>
				</h3>
				{description ? <p data-testid={`${testId}-description`} className='mb-2.5 ml-11 text-xs leading-normal text-slate-500 dark:text-muted-foreground'>{description}</p> : null}
				<CollapsibleContent>
					<div className={cn('overflow-hidden rounded-2xl bg-muted dark:bg-muted/50', panelClassName)}>{children}</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	)
}
