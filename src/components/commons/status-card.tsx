import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { RowIcon } from './row-icon'

interface StatusCardProps {
	testId: string
	tone: 'info' | 'success' | 'danger' | 'default'
	icon?: IconSvgElement
	title: string
	description: ReactNode
	actions?: ReactNode
	spinning?: boolean
	headingId?: string
	role?: 'status' | 'alert'
}

/** The shared tonal notice used by receipt processing, active-trip guidance and attachment failures. */
export function StatusCard({ testId, tone, icon, title, description, actions, spinning = false, headingId, role = 'status' }: StatusCardProps) {
	return (
		<Card data-testid={testId} size='receipt' tone={tone}>
			<div className='flex flex-col gap-3'>
				<div className='flex items-start gap-3'>
					{icon ? <RowIcon icon={icon} tone={tone === 'info' ? 'primary' : tone === 'default' ? 'neutral' : tone} size='sm' spinning={spinning} testId={`${testId}-icon`} /> : null}
					<div className='flex min-w-0 flex-1 flex-col gap-1' role={role} aria-live={role === 'status' ? 'polite' : undefined}>
						<h2 id={headingId} tabIndex={headingId ? -1 : undefined} className='font-display text-base leading-normal font-semibold'>{title}</h2>
						<div className='text-sm leading-normal'>{description}</div>
					</div>
				</div>
				{actions ? <div className='flex flex-col gap-2 sm:flex-row'>{actions}</div> : null}
			</div>
		</Card>
	)
}
