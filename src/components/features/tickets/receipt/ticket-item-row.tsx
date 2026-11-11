'use client'

import { useId, useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { AddCircleIcon, Dollar01Icon, HelpCircleIcon, Link01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

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
	/** The list the line is compared with, named in the proposal ("In Pantry"). */
	listName?: string
	actions?: Pick<ReceiptMatchActions, 'confirm' | 'addAsNew' | 'chooseAnother'>
}

const BADGES: Record<ReceiptTriageBadge, { label: string; variant: 'tag' | 'tag-attention'; icon: IconSvgElement }> = {
	'in-list': { label: 'In list', variant: 'tag', icon: Tick02Icon },
	new: { label: 'New item', variant: 'tag', icon: AddCircleIcon },
	'confirm-match': { label: 'Match suggested', variant: 'tag-attention', icon: HelpCircleIcon },
	'no-price': { label: 'No price', variant: 'tag-attention', icon: Dollar01Icon },
}

/**
 * One extracted item: a 44px checkbox target that includes it in what is added, the name in Title Case with its status tags, and
 * the line price in mono over its quantity chip. Under the row, a proposed match is confirmed, redirected or declined on the spot.
 */
export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle, line, listName, actions }: TicketItemRowProps) {
	const checkboxId = useId()
	const name = formatItemName(item.name)

	return (
		<div data-testid={`ticket-item-row-${item.id}`} data-selected={selected}>
			<label
				htmlFor={canSelect ? checkboxId : undefined}
				className={`flex min-h-16 items-center gap-2 py-1.5 ${canSelect ? 'cursor-pointer' : ''}`}
			>
				{canSelect ? (
					<span className='-ml-2.5 flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							id={checkboxId}
							checked={selected}
							onCheckedChange={() => onSelectToggle?.(item.id)}
							aria-label={`Include ${name}`}
							size='lg'
						/>
					</span>
				) : null}
				<span className='flex min-w-0 flex-1 flex-col gap-1.5'>
					<span className='truncate text-sm leading-[1.3] font-semibold'>{name}</span>
					{line ? (
						<span className='flex min-w-0 flex-wrap items-center gap-1.5'>
							{line.badges.map(badge => (
								<Badge key={badge} variant={BADGES[badge].variant}>
									<HugeiconsIcon icon={BADGES[badge].icon} strokeWidth={1.7} aria-hidden='true' />
									{BADGES[badge].label}
								</Badge>
							))}
							{line.remembered ? <span className='text-xs text-muted-foreground'>Remembered from an earlier receipt</span> : null}
						</span>
					) : null}
				</span>
				<span className='flex shrink-0 flex-col items-end gap-1.5'>
					<span className='font-mono text-sm leading-none font-semibold tabular-nums'>{item.price !== null ? formatCurrency(item.price) : '—'}</span>
					<span className='inline-flex h-5.5 items-center gap-1 rounded-lg bg-secondary px-2 text-xs leading-none font-medium text-slate-600 dark:bg-muted dark:text-muted-foreground'>
						<b className='font-mono font-semibold text-foreground tabular-nums'>{item.quantity ?? 1}</b>
						{item.unit || 'unit'}
					</span>
				</span>
			</label>
			{line && actions ? <ProposedMatch line={line} name={name} listName={listName} actions={actions} /> : null}
		</div>
	)
}

interface ProposedMatchProps {
	line: ReceiptTriageLine
	name: string
	listName?: string
	actions: NonNullable<TicketItemRowProps['actions']>
}

/** What the server proposed for a line and what the user decided: three ways to settle it while pending, the outcome and Change after. */
function ProposedMatch({ line, name, listName, actions }: ProposedMatchProps) {
	const [changing, setChanging] = useState(false)
	const suggestion = line.match?.match === 'none' ? line.match.suggestion : null
	if (!suggestion) return null

	const settle = (apply: () => void) => () => {
		setChanging(false)
		apply()
	}

	if (line.decision && !changing) {
		const decision = line.decision
		const linked = decision.kind === 'link'
		return (
			<div data-testid={`receipt-match-outcome-${line.item.id}`} className='mb-2 flex items-center justify-between gap-3 rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100 ring-inset dark:bg-blue-500/10 dark:ring-blue-500/30'>
				<div className='flex min-w-0 items-center gap-2.5'>
					<HugeiconsIcon icon={linked ? Link01Icon : AddCircleIcon} strokeWidth={1.8} aria-hidden='true' className='size-4.5 shrink-0 text-primary' />
					<div className='flex min-w-0 flex-col gap-0.5'>
						<span className='text-xs leading-[1.2] font-semibold tracking-wide text-slate-500 uppercase dark:text-muted-foreground'>{linked ? 'Matched to' : 'Added as'}</span>
						<span className='truncate text-sm leading-[1.3] font-semibold'>{decision.kind === 'link' ? formatItemName(decision.item.name) : 'New item'}</span>
					</div>
				</div>
				<Button type='button' variant='ghost-primary' size='touch' onClick={() => setChanging(true)}>
					Change<span className='sr-only'> match for {name}</span>
				</Button>
			</div>
		)
	}

	return (
		<div data-testid={`receipt-match-proposal-${line.item.id}`} className='mb-2 flex flex-col gap-2.5 rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100 ring-inset dark:bg-blue-500/10 dark:ring-blue-500/30'>
			<div className='flex min-w-0 flex-col gap-0.5'>
				<span className='text-xs leading-[1.2] font-semibold tracking-wide text-slate-500 uppercase dark:text-muted-foreground'>Possible match</span>
				<span className='text-sm leading-[1.3] font-semibold'>{formatItemName(suggestion.name)}</span>
				{listName ? <span className='text-xs leading-[1.4] text-slate-500 dark:text-muted-foreground'>In {listName}</span> : null}
			</div>
			<Button type='button' size='lg' className='w-full' onClick={settle(() => actions.confirm(line.item.id, suggestion))}>
				<HugeiconsIcon icon={Tick02Icon} strokeWidth={1.8} aria-hidden='true' />
				Confirm Match<span className='sr-only'> for {name}</span>
			</Button>
			<div className='grid grid-cols-2 gap-2'>
				<Button type='button' variant='outline' size='lg' onClick={settle(() => actions.chooseAnother(line.item.id))}>
					Choose Another<span className='sr-only'> item for {name}</span>
				</Button>
				<Button type='button' variant='outline' size='lg' onClick={settle(() => actions.addAsNew(line.item.id))}>
					Add as New<span className='sr-only'>: {name}</span>
				</Button>
			</div>
		</div>
	)
}
