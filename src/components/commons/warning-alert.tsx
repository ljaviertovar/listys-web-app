import type { ComponentProps, ReactNode } from 'react'
import { Alert02Icon } from '@hugeicons/core-free-icons'

import { Alert } from '@/components/ui/alert'
import { RowIcon } from './row-icon'

type WarningAlertProps = Omit<ComponentProps<typeof Alert>, 'children' | 'data-testid' | 'variant'> & {
	children: ReactNode
	iconTestId?: string
	testId: string
}

/** A warning alert always uses the shared warning glyph, so its tone is clear without relying on color alone. */
export function WarningAlert({ children, iconTestId, testId, ...props }: WarningAlertProps) {
	return (
		<Alert {...props} data-testid={testId} variant='warning'>
			<RowIcon icon={Alert02Icon} tone='warning' size='alert' testId={iconTestId ?? `${testId}-icon`} />
			{children}
		</Alert>
	)
}
