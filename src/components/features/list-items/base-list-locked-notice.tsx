import { InformationCircleIcon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
	testId: string
	className?: string
}

export function BaseListLockedNotice({ testId, className }: Props) {
	return (
		<Alert variant='info' role='status' data-testid={testId} className={className}>
			<RowIcon icon={InformationCircleIcon} tone='primary' size='alert' />
			<AlertDescription>
				A shopping session is using this list. Make changes in that session, or finish it to edit this base list.
			</AlertDescription>
		</Alert>
	)
}
