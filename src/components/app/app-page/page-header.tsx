'use client'

import { Fragment, ReactNode, memo } from 'react'
import { Invoice01Icon, ListViewIcon, ShoppingBag03Icon, Store03Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

import { DataFacts, type DataFact } from '@/components/commons/data-line/data-line'
import { InlineCounter } from '@/components/commons/inline-counter/inline-counter'
import { RowIcon } from '@/components/commons/row-icon'
import { cn } from '@/utils'
import BackLink from '../back-link'

type RowIconTone = 'primary' | 'success' | 'ocr' | 'store'

/** The thing a screen is about. It picks the tile icon and its tint, so every screen of an entity wears the same one. */
export type PageHeaderEntity = 'list' | 'receipt' | 'trip' | 'store'

const ENTITY_TILES: Record<PageHeaderEntity, { icon: IconSvgElement; tone: RowIconTone }> = {
	list: { icon: ListViewIcon, tone: 'primary' },
	receipt: { icon: Invoice01Icon, tone: 'ocr' },
	trip: { icon: ShoppingBag03Icon, tone: 'success' },
	store: { icon: Store03Icon, tone: 'store' },
}

export type PageHeaderFact = DataFact

interface PageHeaderProps {
	title: string
	/** `index` is a list screen (one-line title); `detail` is an object screen (two-line title, aside aligned to the first line). */
	layout?: 'index' | 'detail'
	/** The link above the title. Its label is always "Back to {parent}". */
	back?: { href: string; label: string }
	entity?: PageHeaderEntity
	/** One action or status at the end of the title row. */
	aside?: ReactNode
	desc?: ReactNode
	/** Classification: entity label and badges. Empty entries are skipped. */
	chips?: Array<ReactNode>
	/** At most three facts, in this order: quantity, time, amount. Empty entries are skipped. */
	facts?: Array<PageHeaderFact | null | false | undefined>
	/** Index screens: how many things the screen lists. */
	count?: { value: number; one: string; many: string }
	/** Extra content beside the header block from `md`, such as a screen-specific action. */
	children?: ReactNode
	testId?: string
}

/**
 * The header of every screen (canvas 3): one component whose slots a page fills and never restyles. Back link, entity tile,
 * title, aside and description make up the identity group; chips, data line and count make up the metadata group below it.
 * An empty slot renders nothing, and the metadata group disappears when its three slots are empty.
 */
function PageHeaderContent({
	title,
	layout = 'index',
	back,
	entity,
	aside,
	desc,
	chips,
	facts,
	count,
	children,
	testId = 'page-header',
}: PageHeaderProps) {
	const detail = layout === 'detail'
	const tile = entity ? ENTITY_TILES[entity] : null
	const visibleChips = (chips ?? []).filter(Boolean)
	const visibleFacts = (facts ?? []).filter((fact): fact is PageHeaderFact => Boolean(fact))
	// A count of zero is left to the screen's empty state.
	const visibleCount = count && count.value > 0 ? count : null
	const hasMeta = visibleChips.length > 0 || visibleFacts.length > 0 || Boolean(visibleCount)

	return (
		<header
			data-testid={testId}
			data-layout={layout}
			className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-5 pb-4 md:flex-row md:items-end md:justify-between md:px-6 md:pt-6 lg:px-8'
		>
			<div className='flex min-w-0 flex-1 flex-col gap-2'>
				{back ? (
					<BackLink
						href={back.href}
						label={back.label}
						variant='screen'
					/>
				) : null}

				<div className='flex min-w-0 flex-col gap-1'>
					<div className={cn('flex min-w-0 gap-3', detail ? 'items-start' : 'items-center')}>
						{tile ? (
							<RowIcon
								icon={tile.icon}
								tone={tile.tone}
								size='sm'
								testId='page-header-icon'
							/>
						) : null}
						<h1
							className={cn(
								'min-w-0 flex-1 font-display text-2xl leading-8 font-bold tracking-tight',
								detail ? 'line-clamp-2' : 'max-w-[25ch] truncate text-balance',
							)}
						>
							{title}
						</h1>
						{aside ? <div className={cn('ml-auto shrink-0', detail && 'mt-1.5')}>{aside}</div> : null}
					</div>
					{desc ? <div className='max-w-prose text-base leading-6 text-muted-foreground'>{desc}</div> : null}
				</div>

				{hasMeta ? (
					<div className='mt-1 flex flex-col items-start gap-2'>
						{visibleChips.length > 0 ? (
							<div
								data-testid={`${testId}-chips`}
								className='flex flex-wrap items-center gap-x-3 gap-y-2'
							>
								{visibleChips.map((chip, index) => (
									<Fragment key={index}>{chip}</Fragment>
								))}
							</div>
						) : null}
						{visibleFacts.length > 0 ? (
							<DataFacts facts={visibleFacts} testId={`${testId}-data`} />
						) : null}
						{visibleCount ? (
							<InlineCounter
								count={visibleCount.value}
								one={visibleCount.one}
								many={visibleCount.many}
								testId={`${testId}-count`}
							/>
						) : null}
					</div>
				) : null}
			</div>
			{children}
		</header>
	)
}

export default memo(PageHeaderContent)
