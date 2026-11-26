import { cn } from '@/utils'

type PerforationProps = {
	/** `paper` on the light sections, `night` on the dark band and footer. */
	tone?: 'paper' | 'night'
	testId?: string
	className?: string
}

/** The dotted line a receipt tears along; it is the only divider between landing sections. */
export function Perforation({ tone = 'paper', testId = 'landing-perforation', className }: PerforationProps) {
	return (
		<div
			aria-hidden='true'
			data-testid={testId}
			className={cn(
				'h-0.5 w-full bg-size-[12px_2px] bg-position-[0_50%] bg-repeat-x',
				tone === 'paper'
					? 'bg-[radial-gradient(circle,var(--color-paper-line)_1.6px,transparent_2px)]'
					: 'bg-[radial-gradient(circle,var(--color-night-line)_1.6px,transparent_2px)]',
				className,
			)}
		/>
	)
}
