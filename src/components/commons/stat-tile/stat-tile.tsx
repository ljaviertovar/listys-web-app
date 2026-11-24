import type { ComponentProps } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { RowIcon } from '../row-icon'

interface StatTileProps {
	testId: string
	value: string | number
	label: string
	/** A small suffix beside the number ('d', 'Feb'). */
	unit?: string
	icon?: IconSvgElement
	iconTone?: ComponentProps<typeof RowIcon>['tone']
	variant?: 'muted' | 'white'
	/** External layout only (a flex or grid placement); the tile's own look comes from its variant. */
	className?: string
}

/** A compact datum; the white variant gives receipt-review counters their status icon without making them controls. */
export function StatTile({ testId, value, unit, label, icon, iconTone = 'neutral', variant = 'muted', className }: StatTileProps) {
	return (
		<Card data-testid={testId} variant='stat' size='stat' tone={variant === 'muted' ? 'muted' : 'default'} className={className}>
			<div className='flex items-center justify-between gap-2'>
				{icon ? <RowIcon icon={icon} tone={iconTone} size='stat' testId={`${testId}-icon`} /> : null}
				<span className={variant === 'white' ? 'font-mono text-2xl leading-none font-medium tabular-nums' : 'font-mono text-xl leading-none font-medium tabular-nums'}>{value}{unit ? <span className='ml-0.5 font-sans text-xs leading-none font-medium text-muted-foreground dark:text-muted-foreground'>{unit}</span> : null}</span>
			</div>
			<span className={variant === 'white' ? 'text-xs leading-tight font-semibold text-muted-foreground dark:text-muted-foreground' : 'text-xs leading-normal text-muted-foreground dark:text-muted-foreground'}>{label}</span>
		</Card>
	)
}
