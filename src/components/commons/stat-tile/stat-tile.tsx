import type { ComponentProps } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { RowIcon } from '../row-icon'

interface StatTileProps {
	testId: string
	value: string | number
	label: string
	icon?: IconSvgElement
	iconTone?: ComponentProps<typeof RowIcon>['tone']
	variant?: 'muted' | 'white'
}

/** A compact datum; the white variant gives receipt-review counters their status icon without making them controls. */
export function StatTile({ testId, value, label, icon, iconTone = 'neutral', variant = 'muted' }: StatTileProps) {
	return (
		<Card data-testid={testId} variant='stat' size='stat' tone={variant === 'muted' ? 'muted' : 'default'}>
			<div className='flex items-center justify-between gap-2'>
				{icon ? <RowIcon icon={icon} tone={iconTone} size='stat' testId={`${testId}-icon`} /> : null}
				<span className={variant === 'white' ? 'font-mono text-2xl leading-none font-semibold tabular-nums' : 'font-mono text-xl leading-none font-semibold tabular-nums'}>{value}</span>
			</div>
			<span className={variant === 'white' ? 'text-xs leading-normal font-semibold text-slate-600 dark:text-muted-foreground' : 'text-xs leading-normal text-slate-500 dark:text-muted-foreground'}>{label}</span>
		</Card>
	)
}
