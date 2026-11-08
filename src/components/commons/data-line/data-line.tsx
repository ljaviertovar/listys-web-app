import { Children, Fragment, type ReactNode } from 'react'

interface DataLineProps {
	/** At most three facts, in this order: quantity, time, total amount (the amount always last). Empty ones are left out. */
	children: ReactNode
	testId?: string
}

/** A figure of a data line: IBM Plex Mono, tabular, in the ink colour so it stands out from the grey words around it. */
export function DataFigure({ children }: { children: ReactNode }) {
	return <span className='font-mono font-medium text-foreground tabular-nums'>{children}</span>
}

/**
 * The data level of an object card or a screen title (canvas 4/7): facts separated by "·" in Inter 14 slate, with the figures in mono.
 * It replaces the grey mono 12 line these cards used to carry.
 */
export function DataLine({ children, testId = 'data-line' }: DataLineProps) {
	const facts = Children.toArray(children)
	if (facts.length === 0) return null

	return (
		<p
			data-testid={testId}
			className='text-sm leading-normal text-slate-600 dark:text-muted-foreground'
		>
			{facts.map((fact, index) => (
				<Fragment key={index}>
					{index > 0 ? <span aria-hidden='true'> · </span> : null}
					{fact}
				</Fragment>
			))}
		</p>
	)
}
