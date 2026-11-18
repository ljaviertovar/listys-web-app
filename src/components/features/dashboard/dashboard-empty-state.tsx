import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { RowIcon } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

interface Props {
    testId: string
    icon: IconSvgElement
    tone: 'primary' | 'ocr' | 'success' | 'warning' | 'store'
    title: string
    message: ReactNode
    action?: ReactNode
    /** What stands where the icon tile does: the month's grey ring, for one. */
    media?: ReactNode
	/** Informational blue treatment for empty states that need to guide the next action. */
	variant?: 'default' | 'info'
}

/**
 * The empty state inside a dashboard card: one row of the native Item anatomy, like the rows around it. Informational states
 * use the shared blue Alert treatment so its next action reads as guidance.
 */
export function DashboardEmptyState({ testId, icon, tone, title, message, action, media, variant = 'default' }: Props) {
	if (variant === 'info') {
		return (
			<Alert variant='info' role='note' data-testid={testId}>
				<RowIcon icon={icon} tone={tone} size='alert' testId={`${testId}-icon`} />
				<div>
					<AlertTitle><h3>{title}</h3></AlertTitle>
					<AlertDescription>{message}</AlertDescription>
					{action ? <div className='pt-2'>{action}</div> : null}
				</div>
			</Alert>
		)
	}

	return (
		<Item size='sm' data-testid={testId}>
			<ItemMedia>
				{media ?? <RowIcon icon={icon} tone={tone} size='md' testId={`${testId}-icon`} />}
			</ItemMedia>
			<ItemContent>
				<ItemTitle><h3>{title}</h3></ItemTitle>
				<ItemDescription>{message}</ItemDescription>
				{action ? <div className='pt-2'>{action}</div> : null}
			</ItemContent>
		</Item>
	)
}
