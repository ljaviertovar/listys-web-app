'use client'

import type { ReactNode, Ref } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Note01Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils'

import { ActionLink } from '../action-link/action-link'
import { DataLine } from '../data-line/data-line'
import { InlineCounter } from '../inline-counter/inline-counter'
import { RowMenu, type RowMenuAction } from '../row-menu/row-menu'

type EntityCardMenu =
	| {
			/** Names the thing the menu belongs to: the list. */
			label: string
			editLabel: string
			deleteLabel: string
			onEdit: () => void
			onDelete: () => void
			disabled?: boolean
	  }
	| {
			label: string
			/** The card's own actions, for a card whose menu is not edit and delete (a store: rename, merge). */
			actions: RowMenuAction[]
			disabled?: boolean
	  }

interface EntityCardProps {
	size?: 'default' | 'list'
	/** Where the footer link goes; a card with nothing to open leaves it out and has no link. */
	href?: string
	icon: IconSvgElement
	/** The icon tile's colour: blue for a list, violet for a store. */
	tone?: 'default' | 'store'
	title: string
	description?: string | null
	/** The classification row under the note: the card's tags and entities (a list's Default tag). */
	badge?: ReactNode
	/** One quiet line under the description (when the list was last shopped, who it is shared with). */
	meta?: string | null
	/** How many things the card holds, with the words that name them; the card reads "No <emptyLabel> yet" at zero. */
	count: number | null
	unit: { one: string; many: string }
	emptyLabel: string
	/** Text of the link in the footer ("View Details", "View Items"). */
	linkLabel?: string
	footerAction?: ReactNode
	/** The "⋯" menu, with edit and delete or the card's own actions; a read-only card passes none. */
	menu?: EntityCardMenu
	menuTriggerRef?: Ref<HTMLButtonElement>
	testId: string
}

/**
 * A list of the Lists section: an icon tile, its name and one line of description, a "⋯" menu, and a footer
 * with how much it holds. Only the footer action navigates, leaving the rest of the card available for other interactions.
 */
export function EntityCard({
	size = 'default',
	href,
	icon,
	tone = 'default',
	title,
	description,
	badge,
	meta,
	count,
	unit,
	emptyLabel,
	linkLabel,
	footerAction,
	menu,
	menuTriggerRef,
	testId,
}: EntityCardProps) {
	return (
		<article
			data-testid={testId}
			data-size={size}
			className='flex flex-col gap-2 rounded-3xl bg-card p-3.5 shadow-card md:gap-3'
		>
			<div className='flex items-center gap-3'>
				<span
					className={cn(
						'flex size-9 shrink-0 items-center justify-center rounded-xl',
						tone === 'store'
							? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
							: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
					)}
				>
					<HugeiconsIcon
						icon={icon}
						strokeWidth={1.5}
						aria-hidden='true'
						className='size-4.5'
					/>
				</span>
				<h2 className='min-w-0 flex-1 truncate font-display text-base leading-[1.5] font-semibold'>{title}</h2>
				{menu ? (
					<RowMenu
						label={menu.label}
						triggerRef={menuTriggerRef}
						disabled={menu.disabled}
						testId={`${testId}-menu`}
						className='-mr-2'
						actions={
							'actions' in menu
								? menu.actions
								: [
										{ label: menu.editLabel, icon: Edit02Icon, onSelect: menu.onEdit },
										{ label: menu.deleteLabel, icon: Delete02Icon, onSelect: menu.onDelete, tone: 'danger' },
									]
						}
					/>
				) : null}
			</div>
			{description || badge || meta ? (
				<div className='flex flex-col gap-2.5'>
					{description ? (
						<p className='flex items-start gap-1.5 text-sm leading-[1.4] text-text-secondary dark:text-muted-foreground'>
							<HugeiconsIcon icon={Note01Icon} strokeWidth={1.7} aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-slate-500 dark:text-muted-foreground' />
							<span className='line-clamp-2 break-words'>{description}</span>
						</p>
					) : null}
					{badge ? <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>{badge}</div> : null}
					{meta ? (
						<DataLine testId={`${testId}-data`}>{meta}</DataLine>
					) : null}
				</div>
			) : null}
			<div className='flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-border'>
				{count !== null && count > 0 ? (
					<InlineCounter
						count={count}
						one={unit.one}
						many={unit.many}
						testId={`${testId}-count`}
					/>
				) : (
					<span className='text-sm leading-none text-body dark:text-muted-foreground'>
						{count === null ? 'Count unavailable' : `No ${emptyLabel} yet`}
					</span>
				)}
				{footerAction ?? (href && linkLabel ? (
					<ActionLink href={href} aria-label={`${linkLabel} in ${title}`} className='shrink-0'>
						{linkLabel}
					</ActionLink>
				) : null)}
			</div>
		</article>
	)
}
