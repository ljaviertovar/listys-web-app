'use client'

import { useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatItemName } from '@/utils'

import { resolvedItem, type LineDecision, type MatchedItem, type MergeReview, type ReviewLine } from './helpers/merge-review'
import { LinkItemDialog } from './link-item-dialog'

interface MergeReviewStepProps {
	review: MergeReview
	listItems: MatchedItem[]
	decisions: ReadonlyMap<string, LineDecision>
	onDecide: (ticketItemId: string, decision: LineDecision | null) => void
	disabled?: boolean
}

/**
 * Review Matches: before anything is added, the lines that would become new items can be linked to an existing item, and
 * the lines matched by a link remembered from an earlier receipt can be changed. Lines with the name of an item just
 * update it and are listed folded.
 */
export function MergeReviewStep({ review, listItems, decisions, onDecide, disabled = false }: MergeReviewStepProps) {
	const [linking, setLinking] = useState<ReviewLine | null>(null)

	return (
		<div
			data-testid='merge-review-step'
			className='flex flex-col gap-5'
		>
			{review.fresh.length > 0 ? (
				<ReviewSection
					title='New items'
					count={review.fresh.length}
					hint='These lines aren’t in the list yet. Link one if it’s the same product as an item you have.'
					testId='merge-review-new'
				>
					{review.fresh.map(line => (
						<ReviewRow
							key={line.ticketItemId}
							line={line}
							decision={decisions.get(line.ticketItemId)}
							remembered={false}
							disabled={disabled}
							onLink={() => setLinking(line)}
							onAddAsNew={() => onDecide(line.ticketItemId, null)}
						/>
					))}
				</ReviewSection>
			) : null}

			{review.remembered.length > 0 ? (
				<ReviewSection
					title='Remembered matches'
					count={review.remembered.length}
					hint='You linked these lines on an earlier receipt. Change them if they’re not the same product.'
					testId='merge-review-remembered'
				>
					{review.remembered.map(line => (
						<ReviewRow
							key={line.ticketItemId}
							line={line}
							decision={decisions.get(line.ticketItemId)}
							remembered
							disabled={disabled}
							onLink={() => setLinking(line)}
							onAddAsNew={() => onDecide(line.ticketItemId, { kind: 'new' })}
						/>
					))}
				</ReviewSection>
			) : null}

			{review.byName.length > 0 ? (
				<Collapsible
					data-testid='merge-review-by-name'
					className='group/by-name'
				>
					<CollapsibleTrigger variant='row'>
						<span className='flex-1 text-sm font-semibold'>
							Updates by name{' '}
							<span className='font-mono text-xs font-medium text-slate-500 tabular-nums dark:text-muted-foreground'>{review.byName.length}</span>
						</span>
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							strokeWidth={2}
							aria-hidden='true'
							className='size-4 transition-transform group-data-[state=open]/by-name:rotate-180 motion-reduce:transition-none'
						/>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ul className='flex flex-col gap-1 rounded-2xl bg-muted px-3 py-2 text-sm'>
							{review.byName.map(line => (
								<li
									key={line.ticketItemId}
									className='break-words'
								>
									{formatItemName(line.name)}
								</li>
							))}
						</ul>
					</CollapsibleContent>
				</Collapsible>
			) : null}

			<LinkItemDialog
				lineName={linking?.name ?? null}
				currentItemId={linking ? resolvedItem(linking, decisions.get(linking.ticketItemId))?.id : null}
				items={listItems}
				onClose={() => setLinking(null)}
				onLink={item => {
					if (linking) onDecide(linking.ticketItemId, { kind: 'link', item })
					setLinking(null)
				}}
			/>
		</div>
	)
}

interface ReviewSectionProps {
	title: string
	count: number
	hint: string
	testId: string
	children: ReactNode
}

function ReviewSection({ title, count, hint, testId, children }: ReviewSectionProps) {
	return (
		<section
			data-testid={testId}
			aria-label={title}
			className='flex flex-col gap-2'
		>
			<div className='flex flex-col gap-0.5'>
				<h3 className='text-sm font-semibold'>
					{title}{' '}
					<span className='font-mono text-xs font-medium text-slate-500 tabular-nums dark:text-muted-foreground'>{count}</span>
				</h3>
				<p className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>{hint}</p>
			</div>
			<ul className='flex flex-col gap-2'>{children}</ul>
		</section>
	)
}

interface ReviewRowProps {
	line: ReviewLine
	decision: LineDecision | undefined
	remembered: boolean
	disabled: boolean
	onLink: () => void
	onAddAsNew: () => void
}

function ReviewRow({ line, decision, remembered, disabled, onLink, onAddAsNew }: ReviewRowProps) {
	const target = resolvedItem(line, decision)
	const name = formatItemName(line.name)

	let outcome: string
	if (!target) outcome = 'Will be added as a new item'
	else if (remembered && decision === undefined) outcome = `Updates “${formatItemName(target.name)}” · remembered from an earlier receipt`
	else outcome = `Updates “${formatItemName(target.name)}”`

	return (
		<li
			data-testid='merge-review-row'
			className='flex flex-col gap-2 rounded-2xl bg-muted px-3 py-2.5 sm:flex-row sm:items-center'
		>
			<div className='flex min-w-0 flex-1 flex-col'>
				<span className='break-words text-sm font-medium'>{name}</span>
				<span className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>{outcome}</span>
			</div>
			<div className='flex shrink-0 gap-2'>
				<Button
					type='button'
					variant='secondary'
					size='primary'
					disabled={disabled}
					onClick={onLink}
					aria-label={`${target ? 'Change the item for' : 'Link'} ${name}`}
				>
					{target ? 'Change…' : 'Link to…'}
				</Button>
				{target ? (
					<Button
						type='button'
						variant='quiet'
						size='primary'
						disabled={disabled}
						onClick={onAddAsNew}
						aria-label={`Add ${name} as a new item`}
					>
						Add as New
					</Button>
				) : null}
			</div>
		</li>
	)
}
