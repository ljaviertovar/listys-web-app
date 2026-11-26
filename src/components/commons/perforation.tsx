import { cn } from '@/utils'

type PerforationProps = {
	/** `paper` on light surfaces, `night` on the landing's dark band and footer. */
	tone?: 'paper' | 'night'
	testId?: string
	className?: string
}

/** The dotted line a receipt tears along; the divider of the landing sections and of the auth screens. */
export function Perforation({ tone = 'paper', testId = 'perforation', className }: PerforationProps) {
	return (
		<div
			aria-hidden='true'
			data-testid={testId}
			className={cn(
				'h-0.5 w-full bg-size-[12px_2px] bg-position-[0_50%] bg-repeat-x',
				tone === 'paper'
					? 'bg-[radial-gradient(circle,var(--color-paper-line)_1.6px,transparent_2px)] dark:bg-[radial-gradient(circle,var(--color-border)_1.6px,transparent_2px)]'
					: 'bg-[radial-gradient(circle,var(--color-night-line)_1.6px,transparent_2px)]',
				className,
			)}
		/>
	)
}
