'use client'

import { useId, useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { AddCircleIcon, Clock02Icon, Dollar01Icon, HelpCircleIcon, Link04Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Field, FieldLabel } from '@/components/ui/field'
import { ItemQuantityChip } from '@/components/features/list-items/item-quantity-chip'
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

const BADGES: Record<ReceiptTriageBadge, { label: string; variant: 'outline' | 'warning'; icon: IconSvgElement }> = {
	'in-list': { label: 'In list', variant: 'outline', icon: Tick02Icon },
	new: { label: 'New item', variant: 'outline', icon: AddCircleIcon },
	'confirm-match': { label: 'Match suggested', variant: 'warning', icon: HelpCircleIcon },
	'no-price': { label: 'No price', variant: 'warning', icon: Dollar01Icon },
}

/**
 * One extracted item: a 44px checkbox target that includes it in what is added, then the quantity and the name in Title Case on the
 * first line with its status tags under them, and the line price in mono on the right. Under the row, a proposed match is confirmed,
 * redirected or declined on the spot.
 */
export function TicketItemRow({ item, canSelect = false, selected = false, onSelectToggle, line, listName, actions }: TicketItemRowProps) {
	const checkboxId = useId()
	const name = formatItemName(item.name)

	return (
		<div data-testid={`ticket-item-row-${item.id}`} data-selected={selected}>
			<FieldLabel
				htmlFor={canSelect ? checkboxId : undefined}
				variant='plain'
				size='compact'
			>
			<Field orientation='horizontal' spacing='compact' className='items-start'>
				{canSelect ? (
					<span className='-mt-3 -ml-2 flex size-11 shrink-0 items-center justify-center'>
						<Checkbox
							id={checkboxId}
							checked={selected}
							onCheckedChange={() => onSelectToggle?.(item.id)}
							aria-label={`Include ${name}`}
							size='lg'
						/>
					</span>
				) : null}
				<span className='flex min-w-0 flex-1 flex-col gap-1'>
					<span className='flex items-start gap-2'>
						<ItemQuantityChip quantity={item.quantity} unit={item.unit} testId={`ticket-item-${item.id}-quantity`} />
						<span className='line-clamp-2 min-w-0 flex-1 text-sm leading-5 font-semibold break-words'>{name}</span>
					</span>
					{line ? (
						<span className='flex min-w-0 flex-wrap items-center gap-1.5'>
							{line.badges.map(badge => (
								<Badge key={badge} variant={BADGES[badge].variant}>
									<HugeiconsIcon icon={BADGES[badge].icon} strokeWidth={1.7} aria-hidden='true' />
									{BADGES[badge].label}
								</Badge>
							))}
							{line.remembered ? <Badge variant='outline'><HugeiconsIcon icon={Clock02Icon} strokeWidth={1.7} aria-hidden='true' />Remembered</Badge> : null}
						</span>
					) : null}
				</span>
				<span className='shrink-0 font-mono text-sm leading-5 font-medium tabular-nums'>{item.price !== null ? formatCurrency(item.price) : '—'}</span>
			</Field>
			</FieldLabel>
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

/**
 * What the server proposed for a line and what the user decided. While pending it is a white card under the row: the candidate on one
 * line and the three ways to settle it, with the only blue on the primary button. Once decided the card goes away and the outcome is
 * one line with an outline Change button.
 */
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
			<div data-testid={`receipt-match-outcome-${line.item.id}`} className='flex items-center gap-2 px-3 pb-2 text-sm leading-5'>
				<HugeiconsIcon icon={linked ? Link04Icon : AddCircleIcon} strokeWidth={1.8} aria-hidden='true' className='size-3.5 shrink-0 text-muted-foreground' />
				<span className='min-w-0 flex-1'>
					<span className='text-xs text-muted-foreground dark:text-muted-foreground'>{linked ? 'Matched to' : 'Added as'}</span>{' '}
					<span className='font-semibold break-words'>{decision.kind === 'link' ? formatItemName(decision.item.name) : 'New item'}</span>
				</span>
				<Button type='button' variant='outline' size='default' onClick={() => setChanging(true)}>
					Change<span className='sr-only'> match for {name}</span>
				</Button>
			</div>
		)
	}

	return (
		<div data-testid={`receipt-match-proposal-${line.item.id}`} className='mx-3 mb-3 flex flex-col gap-2 rounded-xl bg-card p-2.5 ring-1 ring-border ring-inset'>
			<div className='flex min-w-0 items-baseline gap-1.5'>
				<HugeiconsIcon icon={Link04Icon} strokeWidth={1.8} aria-hidden='true' className='size-3.5 shrink-0 self-center text-muted-foreground' />
				<span className='min-w-0 text-sm leading-5 font-semibold break-words'><span className='sr-only'>Possible match: </span>{formatItemName(suggestion.name)}</span>
				{listName ? <span className='shrink-0 text-xs leading-4 text-muted-foreground dark:text-muted-foreground'>In {listName}</span> : null}
			</div>
			<Button type='button' size='default' className='w-full' onClick={settle(() => actions.confirm(line.item.id, suggestion))}>
				<HugeiconsIcon icon={Tick02Icon} strokeWidth={1.8} aria-hidden='true' />
				Confirm Match<span className='sr-only'> for {name}</span>
			</Button>
			<div className='grid grid-cols-2 gap-2'>
				<Button type='button' variant='outline' size='default' onClick={settle(() => actions.chooseAnother(line.item.id))}>
					Choose Another<span className='sr-only'> item for {name}</span>
				</Button>
				<Button type='button' variant='outline' size='default' onClick={settle(() => actions.addAsNew(line.item.id))}>
					Add as New<span className='sr-only'>: {name}</span>
				</Button>
			</div>
		</div>
	)
}
