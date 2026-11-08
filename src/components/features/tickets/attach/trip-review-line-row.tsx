import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Clock01Icon, Link01Icon } from '@hugeicons/core-free-icons'

import { ItemQuantityChip } from '@/components/features/list-items'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatItemName } from '@/utils'
import type { AttachReviewLine } from './helpers/build-attach-review'

export function TripReviewLineRow({ line, onChange }: { line: AttachReviewLine; onChange: (id: string) => void }) {
	const name = line.canChange ? formatItemName(line.name) : 'Unreadable line'
	const leftOut = line.decision.kind === 'leave'
	return (
		<div data-testid={`attach-review-line-${line.id}`} className='flex flex-col gap-2 px-3 py-3.5'>
			<div className='flex min-w-0 items-center gap-2'>
				<ItemQuantityChip quantity={line.quantity} unit={line.unit} />
				<span className={cn('min-w-0 flex-1 truncate text-sm font-semibold', leftOut && 'text-slate-400')}>{name}</span>
				<span className={cn('shrink-0 font-mono text-sm font-semibold tabular-nums', leftOut && 'text-slate-400 line-through')}>{line.price == null ? '—' : formatCurrency(line.price)}</span>
			</div>
			{line.tag ? <div><Badge variant={line.tag === 'No name' || line.tag === 'No price' ? 'tag-attention' : 'tag'}>
				<HugeiconsIcon icon={line.tag === 'Remembered' ? Clock01Icon : line.tag === 'Linked by you' ? Link01Icon : Alert02Icon} strokeWidth={1.8} aria-hidden='true' />
				{line.tag}
			</Badge></div> : null}
			<div className='flex items-center justify-between gap-2'>
				<p className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>
					{line.result.startsWith('Matches ') ? <>
						Matches <strong className='font-semibold text-foreground'>{line.result.split(' · ')[0].slice('Matches '.length)}</strong>
						{line.result.split(' · ').slice(1).map((detail, index) => {
							const quantityChange = detail.match(/^(usual quantity )(.+?)( → )(.+)$/)
							return <span key={`${detail}-${index}`}> · {quantityChange
								? <>{quantityChange[1]}<strong className='font-semibold text-foreground'>{quantityChange[2]} → {quantityChange[4]}</strong></>
								: detail}</span>
						})}
					</> : line.result}
				</p>
				{line.canChange ? <Button type='button' variant='ghost-primary' size='quiet-touch' aria-label={`Change ${name}`} onClick={() => onChange(line.id)}>Change</Button> : null}
			</div>
		</div>
	)
}
