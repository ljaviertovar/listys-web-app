import type { ReactNode } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
		<Alert data-testid={testId} variant={tone === 'danger' ? 'destructive' : 'default'} role={role} aria-live={role === 'status' ? 'polite' : undefined}>
			{icon ? <HugeiconsIcon icon={icon} aria-hidden='true' data-testid={`${testId}-icon`} className={spinning ? 'size-4 animate-spin motion-reduce:animate-none' : 'size-4'} /> : null}
			<AlertTitle><h2 id={headingId} tabIndex={headingId ? -1 : undefined}>{title}</h2></AlertTitle>
			<AlertDescription>
				{description}
				{actions ? <div className='mt-3 flex flex-col gap-2 sm:flex-row'>{actions}</div> : null}
			</AlertDescription>
		</Alert>
	)
}
