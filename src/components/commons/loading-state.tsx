import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

interface LoadingStateProps {
	label: string
	testId: string
}

/** A wait inside a card or a sheet: one spinner and a line saying what is happening. The whole-app screen is AppLoading. */
export function LoadingState({ label, testId }: LoadingStateProps) {
	return (
		<div
			data-testid={testId}
			role='status'
			aria-live='polite'
			aria-busy='true'
			aria-label={label}
			className='grid min-h-32 place-content-center justify-items-center gap-3 px-4 py-8 text-center'
		>
			<HugeiconsIcon
				icon={Loading03Icon}
				strokeWidth={2}
				aria-hidden='true'
				className='size-6 animate-spin text-primary motion-reduce:animate-none'
			/>
			<span className='text-sm font-medium text-muted-foreground dark:text-muted-foreground'>{label}</span>
		</div>
	)
}
