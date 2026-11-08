'use client'

import { useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency, formatItemName } from '@/utils'
import type { TicketItem } from '@/types'

import type { ReceiptTriageBadge, ReceiptTriageLine } from './helpers/build-receipt-triage'
import type { ReceiptMatchActions } from './hooks/use-receipt-match-actions'

interface TicketItemRowProps {
	item: TicketItem
	canSelect?: boolean
	selected?: boolean
	onSelectToggle?: (id: string) => void
	/** The line as the comparison sees it (badges and proposed match); absent in the plain category view. */
	line?: ReceiptTriageLine
	actions?: Pick<ReceiptMatchActions, 'confirm' | 'addAsNew' | 'chooseAnother'>
}

const BADGES: Record<ReceiptTriageBadge, { label: string; variant: 'completed' | 'neutral' | 'merged' | 'processing' }> = {
	'in-list': { label: 'In list', variant: 'completed' },
	new: { label: 'New', variant: 'neutral' },
	'confirm-match': { label: 'Confirm match', variant: 'merged' },
	'no-price': { label: 'No price', variant: 'processing' },
}

/**
 * One extracted item: a 44px checkbox target that includes it in what is added, the name in Title Case, its status badges, its
 * quantity chip and the line price in mono. Under the row, a proposed match is confirmed, redirected or declined on the spot.
 */
export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle, line, actions }: TicketItemRowProps) {
	const checkboxId = useId()
	const name = formatItemName(item.name)

	return (
		<div data-testid={`ticket-item-row-${item.id}`} data-selected={selected}>
			<label
				htmlFor={canSelect ? checkboxId : undefined}
				className={`flex min-h-16 items-center gap-1 py-1.5 pr-3.5 lg:min-h-14 lg:gap-3 ${canSelect ? 'cursor-pointer' : 'pl-3.5'}`}
			>
				{canSelect ? (
					<span className='flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							id={checkboxId}
							checked={selected}
							onCheckedChange={() => onSelectToggle?.(item.id)}
							aria-label={`Include ${name}`}
							size='lg'
						/>
					</span>
				) : null}
				<span className='flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-1 lg:contents'>
					<span className='w-full truncate text-sm leading-[1.25] font-semibold lg:min-w-0 lg:flex-1'>{name}</span>
					{line ? (
						<span className='flex w-full flex-wrap items-center gap-1.5 lg:min-w-0 lg:flex-1'>
							{line.badges.map(badge => <Badge key={badge} variant={BADGES[badge].variant}>{BADGES[badge].label}</Badge>)}
							{line.remembered ? <span className='text-xs text-muted-foreground'>Remembered from an earlier receipt</span> : null}
						</span>
					) : null}
					<span className='inline-flex h-5.5 items-center gap-1 rounded-md bg-secondary px-2 text-xs leading-none font-medium text-slate-600 lg:shrink-0 dark:bg-muted dark:text-muted-foreground'>
						<b className='font-mono font-semibold text-foreground tabular-nums'>{item.quantity ?? 1}</b>
						{item.unit || 'unit'}
					</span>
				</span>
				{item.price !== null ? (
					<span className='font-mono text-sm font-semibold tabular-nums lg:w-20 lg:text-right'>{formatCurrency(item.price)}</span>
				) : null}
			</label>
			{line && actions ? <ProposedMatch line={line} name={name} indent={canSelect} actions={actions} /> : null}
		</div>
	)
}

interface ProposedMatchProps {
	line: ReceiptTriageLine
	name: string
	/** Lines up with the name, past the checkbox. */
	indent: boolean
	actions: NonNullable<TicketItemRowProps['actions']>
}

/** What the server proposed for a line and what the user decided: three ways to settle it while pending, the outcome and Change after. */
function ProposedMatch({ line, name, indent, actions }: ProposedMatchProps) {
	const [changing, setChanging] = useState(false)
	const suggestion = line.match?.match === 'none' ? line.match.suggestion : null
	if (!suggestion) return null

	const settle = (apply: () => void) => () => {
		setChanging(false)
		apply()
	}
	const position = indent ? 'pl-13' : 'pl-3.5'

	if (line.decision && !changing) {
		return (
			<div data-testid={`receipt-match-outcome-${line.item.id}`} className={`flex flex-wrap items-center gap-x-2 pr-3.5 pb-1.5 ${position}`}>
				<p className='text-xs text-muted-foreground'>
					{line.decision.kind === 'link'
						? <>Matches <b className='font-semibold text-foreground'>{formatItemName(line.decision.item.name)}</b></>
						: 'Adds as new item'}
				</p>
				<Button type='button' variant='ghost-primary' size='touch' onClick={() => setChanging(true)}>
					Change<span className='sr-only'> match for {name}</span>
				</Button>
			</div>
		)
	}

	return (
		<div data-testid={`receipt-match-proposal-${line.item.id}`} className={`flex flex-col gap-1 pr-3.5 pb-2 ${position}`}>
			<p className='text-xs text-muted-foreground'>
				Possible match: <b className='font-semibold text-foreground'>{formatItemName(suggestion.name)}</b>
			</p>
			<div className='flex flex-wrap gap-x-1 gap-y-0.5'>
				<Button type='button' variant='secondary' size='touch' onClick={settle(() => actions.confirm(line.item.id, suggestion))}>
					Confirm Match<span className='sr-only'> for {name}</span>
				</Button>
				<Button type='button' variant='quiet' size='touch' onClick={settle(() => actions.chooseAnother(line.item.id))}>
					Choose Another<span className='sr-only'> item for {name}</span>
				</Button>
				<Button type='button' variant='quiet' size='touch' onClick={settle(() => actions.addAsNew(line.item.id))}>
					Add as New<span className='sr-only'>: {name}</span>
				</Button>
			</div>
		</div>
	)
}
