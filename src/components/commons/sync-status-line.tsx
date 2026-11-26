import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

interface SyncStatusLineProps {
	message: string
	/** The mark before the message; a message that needs attention has none. */
	icon?: 'saving' | 'saved'
	onRetry?: () => void
}

/** The quiet line under a header that says whether the changes saved in the background reached the server. */
export function SyncStatusLine({ message, icon, onRetry }: SyncStatusLineProps) {
	return (
		<div role='status' aria-live='polite' className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
			<span className='inline-flex items-center gap-1.5'>
				{icon === 'saved' ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} aria-hidden='true' className='size-3.5' /> : null}
				{icon === 'saving' ? <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} aria-hidden='true' className='size-3.5 animate-spin motion-reduce:animate-none' /> : null}
				{message}
			</span>
			{onRetry ? <Button variant='link' size='lg' onClick={onRetry}>Retry</Button> : null}
		</div>
	)
}
