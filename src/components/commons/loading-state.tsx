import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

interface LoadingStateProps {
	label: string
	testId: string
	fullScreen?: boolean
	brand?: ReactNode
}

export function LoadingState({ label, testId, fullScreen = false, brand }: LoadingStateProps) {
	return (
		<div
			data-testid={testId}
			role='status'
			aria-live='polite'
			aria-busy='true'
			aria-label={label}
			className={
				fullScreen
					? 'flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-4 py-8 text-center'
					: 'grid min-h-32 place-content-center justify-items-center gap-3 px-4 py-8 text-center'
			}
		>
			{brand}
			<HugeiconsIcon
				icon={Loading03Icon}
				strokeWidth={2}
				aria-hidden='true'
				className='size-10 animate-spin text-primary motion-reduce:animate-none'
			/>
			<span className='text-sm font-medium text-muted-foreground dark:text-muted-foreground'>{label}</span>
		</div>
	)
}
