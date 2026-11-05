import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Clock01Icon, Link01Icon } from '@hugeicons/core-free-icons'

import { ItemQuantityChip } from '@/components/features/list-items'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatItemName } from '@/utils'
import type { AttachReviewLine } from './helpers/build-attach-review'

export function TripReviewLineRow({ line, onChange }: { line: AttachReviewLine; onChange: (id: string) => void }) {
	const name = line.canChange ? formatItemName(line.name) : 'Unreadable line'
	return (
		<div data-testid={`attach-review-line-${line.id}`} className='flex flex-col gap-2 px-3 py-3.5'>
			<div className='flex min-w-0 items-center gap-2'>
				<ItemQuantityChip quantity={line.quantity} unit={line.unit} />
				<span className='min-w-0 flex-1 truncate text-sm font-semibold'>{name}</span>
				<span className='shrink-0 font-mono text-sm font-semibold tabular-nums'>{line.price == null ? '—' : formatCurrency(line.price)}</span>
			</div>
			{line.tag ? <div><Badge variant={line.tag === 'No name' || line.tag === 'No price' ? 'tag-attention' : 'tag'}>
				<HugeiconsIcon icon={line.tag === 'Remembered' ? Clock01Icon : line.tag === 'Linked by you' ? Link01Icon : Alert02Icon} strokeWidth={1.8} aria-hidden='true' />
				{line.tag}
			</Badge></div> : null}
			<div className='flex items-center justify-between gap-2'>
				<p className='text-xs leading-normal text-slate-500 dark:text-muted-foreground'>{line.result}</p>
				{line.canChange ? <Button type='button' variant='ghost-primary' size='quiet-touch' aria-label={`Change ${name}`} onClick={() => onChange(line.id)}>Change</Button> : null}
			</div>
		</div>
	)
}
