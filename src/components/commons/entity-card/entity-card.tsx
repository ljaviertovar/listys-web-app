'use client'

import type { ReactNode, Ref } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, Edit02Icon, Note01Icon } from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'

import { ActionLink } from '../action-link/action-link'
import { DataFacts, type DataFact } from '../data-line/data-line'
import { InlineCounter } from '../inline-counter/inline-counter'
import { ObjectCardBody, ObjectCardChips, ObjectCardFooter, ObjectCardTitleRow, OBJECT_CARD_LINK } from '../object-card/object-card'
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
	/** Where the footer link goes; a card with nothing to open leaves it out and has no link. */
	href?: string
	title: string
	/** The optional note under the title: the text the user wrote on a list. */
	description?: string | null
	/** The classification row under the note: the card's tags and entities (a list's Default tag). */
	badge?: ReactNode
	/** The data line: when the list was last shopped, a store's last visit and its receipts. Empty entries are skipped. */
	facts?: Array<DataFact | null | false | undefined>
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
 * A list or a store (object card, canvas C1): its name and a "⋯" menu in a 32px row, the optional note, the classification row, the
 * data line and a footer with how much it holds and where it leads. The footer link covers the whole card; the menu and a resume
 * button sit above it.
 */
export function EntityCard({
	href,
	title,
	description,
	badge,
	facts,
	count,
	unit,
	emptyLabel,
	linkLabel,
	footerAction,
	menu,
	menuTriggerRef,
	testId,
}: EntityCardProps) {
	const hasFacts = (facts ?? []).some(Boolean)
	return (
		<Card
			size='object'
			interactive={Boolean(href && linkLabel && !footerAction)}
			role='article'
			data-testid={testId}
		>
			<ObjectCardBody>
				<div className='flex flex-col gap-1'>
					<ObjectCardTitleRow
						title={title}
						aside={
							menu ? (
								<RowMenu
									label={menu.label}
									triggerRef={menuTriggerRef}
									disabled={menu.disabled}
									testId={`${testId}-menu`}
									size='icon-sm'
									// 32px visible, 44px to hit: the title row stays 32px tall and the dots end on the content edge.
									className='relative z-10 -mr-1.5 after:absolute after:-inset-1.5 after:content-[""]'
									actions={
										'actions' in menu
											? menu.actions
											: [
													{ label: menu.editLabel, icon: Edit02Icon, onSelect: menu.onEdit },
													{ label: menu.deleteLabel, icon: Delete02Icon, onSelect: menu.onDelete, tone: 'danger' },
												]
									}
								/>
							) : null
						}
					/>
					{description ? (
						<div className='flex items-start gap-1.5 text-sm leading-5 text-muted-foreground'>
							<HugeiconsIcon icon={Note01Icon} strokeWidth={1.7} aria-hidden='true' className='mt-0.5 size-4 shrink-0' />
							<span className='line-clamp-2 break-words'>{description}</span>
						</div>
					) : null}
				</div>
				{badge ? <ObjectCardChips>{badge}</ObjectCardChips> : null}
				{hasFacts ? <DataFacts facts={facts ?? []} testId={`${testId}-data`} /> : null}
			</ObjectCardBody>
			<ObjectCardFooter>
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
				{footerAction ? (
					<div className='relative z-10 shrink-0'>{footerAction}</div>
				) : href && linkLabel ? (
					<ActionLink href={href} aria-label={`${linkLabel} in ${title}`} className={OBJECT_CARD_LINK} stretched>
						{linkLabel}
					</ActionLink>
				) : null}
			</ObjectCardFooter>
		</Card>
	)
}
