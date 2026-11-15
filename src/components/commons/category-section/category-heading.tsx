import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { getCategoryIcon } from './helpers/category-style'

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
	tone?: 'primary' | 'success' | 'warning' | 'muted' | 'ocr'
	description?: string
}

/**
 * The category icon, caption and count laid out inside the shared collapsible trigger.
 */
export function CategoryHeading({ category, title = category, count, complete = false, testId, icon, tone, description }: CategoryHeadingProps) {
	const headingIcon = icon ?? getCategoryIcon(category)

	return (
		<span data-testid={testId} data-tone={tone} className='contents'>
			<HugeiconsIcon
				data-testid={`${testId}-icon`}
				icon={headingIcon}
				strokeWidth={1.5}
				aria-hidden='true'
				className='size-4 shrink-0 text-foreground'
			/>
			<span className='min-w-0 flex-1'>
				<span className='block font-sans text-xs leading-4 font-medium tracking-wider text-foreground uppercase'>
					{title}
				</span>
				{description ? <span className='mt-1 block text-xs leading-4 font-normal text-muted-foreground normal-case'>{description}</span> : null}
			</span>
			<span
				className={complete
					? 'font-sans text-xs leading-4 font-normal text-feedback-success tabular-nums'
					: 'font-sans text-xs leading-4 font-normal text-muted-foreground tabular-nums'}
			>
				{count}
			</span>
		</span>
	)
}
