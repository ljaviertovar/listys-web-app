'use client'

import Link from 'next/link'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { ArrowRight01Icon, Delete02Icon, Edit02Icon } from '@hugeicons/core-free-icons'

import { RowMenu } from '../row-menu/row-menu'

interface EntityCardProps {
	href: string
	icon: IconSvgElement
	title: string
	description?: string | null
	/** How many things the card holds, with the words that name them; the card reads "No <emptyLabel> yet" at zero. */
	count: number
	unit: { one: string; many: string }
	emptyLabel: string
	/** Text of the link in the footer ("View Details", "View Items"). */
	linkLabel: string
	/** The "⋯" menu with edit and delete; a read-only card (a group of the history) passes none of these. */
	menu?: {
		/** Names the thing the menu belongs to: the group or list. */
		label: string
		editLabel: string
		deleteLabel: string
		onEdit: () => void
		onDelete: () => void
		disabled?: boolean
	}
	testId: string
}

/**
 * A group or a list of the Lists section: an icon tile, its name and one line of description, a "⋯" menu, and a footer
 * with how much it holds. Only the footer action navigates, leaving the rest of the card available for other interactions.
 */
export function EntityCard({
	href,
	icon,
	title,
	description,
	count,
	unit,
	emptyLabel,
	linkLabel,
	menu,
	testId,
}: EntityCardProps) {
	return (
		<article
			data-testid={testId}
			className='flex flex-col gap-2 rounded-3xl bg-card p-3 shadow-card md:gap-3 md:p-4'
		>
			<div className='flex items-center gap-3'>
				<span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'>
					<HugeiconsIcon
						icon={icon}
						strokeWidth={1.5}
						aria-hidden='true'
						className='size-4.5'
					/>
				</span>
				<div className='flex min-w-0 flex-1 flex-col'>
					<h2 className='truncate font-display text-base leading-[1.5] font-semibold'>{title}</h2>
					{description ? (
						<p className='truncate text-sm leading-[1.4] text-slate-500 dark:text-muted-foreground'>{description}</p>
					) : null}
				</div>
				{menu ? (
					<RowMenu
						label={menu.label}
						disabled={menu.disabled}
						testId={`${testId}-menu`}
						className='-mr-2'
						actions={[
							{ label: menu.editLabel, icon: Edit02Icon, onSelect: menu.onEdit },
							{ label: menu.deleteLabel, icon: Delete02Icon, onSelect: menu.onDelete, tone: 'danger' },
						]}
					/>
				) : null}
			</div>
			<div className='flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-border'>
				<span className='text-xs leading-none text-slate-500 dark:text-muted-foreground'>
					{count === 0 ? (
						`No ${emptyLabel} yet`
					) : (
						<>
							<b className='font-mono font-semibold text-foreground tabular-nums'>{count}</b>{' '}
							{count === 1 ? unit.one : unit.many}
						</>
					)}
				</span>
				<Link
					href={href}
					className='group/entity-link inline-flex items-center gap-0.5 rounded-lg px-1 font-display text-sm font-semibold text-blue-700 focus-ring dark:text-blue-300'
				>
					{linkLabel}
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						strokeWidth={2}
						aria-hidden='true'
						className='size-4 transition-transform group-hover/entity-link:translate-x-0.5'
					/>
				</Link>
			</div>
		</article>
	)
}
