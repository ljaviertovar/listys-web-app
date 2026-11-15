'use client'

import type { ReactNode, Ref } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Note01Icon } from '@hugeicons/core-free-icons'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RowIcon } from '../row-icon'

import { ActionLink } from '../action-link/action-link'
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
	icon?: IconSvgElement
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
		<Card
			size='list'
			role='article'
			data-testid={testId}
			data-entity-size={size}
		>
			<CardHeader inset='compact'>
			<div className='flex w-full min-w-0 items-center gap-3'>
				{icon ? <RowIcon icon={icon} tone={tone === 'store' ? 'store' : 'primary'} size='md' testId={`${testId}-icon`} /> : null}
				<CardTitle className='min-w-0 flex-1 overflow-hidden'><h2 className='truncate'>{title}</h2></CardTitle>
				{menu ? (
					<RowMenu
						label={menu.label}
						triggerRef={menuTriggerRef}
						disabled={menu.disabled}
						testId={`${testId}-menu`}
						className='-mr-2 shrink-0'
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
			</CardHeader>
			{description || badge || meta ? (
				<CardContent inset='compact' space='snug'>
					{description ? (
						<CardDescription><div className='flex items-start gap-1.5'>
							<HugeiconsIcon icon={Note01Icon} strokeWidth={1.7} aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
							<span className='line-clamp-2 break-words'>{description}</span>
						</div></CardDescription>
					) : null}
					{badge ? <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>{badge}</div> : null}
					{meta ? <p data-testid={`${testId}-data`} className='text-xs leading-4 text-muted-foreground'>{meta}</p> : null}
				</CardContent>
			) : null}
			<CardFooter inset='compact' variant='summary'>
			<div className='flex w-full items-center justify-between gap-3'>
				{count !== null && count > 0 ? (
					<InlineCounter
						count={count}
						one={unit.one}
						many={unit.many}
						testId={`${testId}-count`}
					/>
				) : (
					<span className='text-sm leading-none text-muted-foreground dark:text-muted-foreground'>
						{count === null ? 'Count unavailable' : `No ${emptyLabel} yet`}
					</span>
				)}
				{footerAction ?? (href && linkLabel ? (
					<ActionLink href={href} aria-label={`${linkLabel} in ${title}`} className='shrink-0'>
						{linkLabel}
					</ActionLink>
				) : null)}
			</div>
			</CardFooter>
		</Card>
	)
}
