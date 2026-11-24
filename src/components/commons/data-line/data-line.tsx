import { Children, Fragment, type ReactNode } from 'react'

interface DataLineProps {
	/** At most three facts, in this order: quantity, time, total amount (the amount always last). Empty ones are left out. */
	children: ReactNode
	testId?: string
}

/** A figure of a data line: IBM Plex Mono, tabular, in the ink colour so it stands out from the grey words around it. */
export function DataFigure({ children, emphasis = 'default' }: { children: ReactNode; emphasis?: 'default' | 'count' | 'total' | 'clock' }) {
	// `count` is the number a card leads with ("3 photos"): one step larger than the figures after it.
	// `clock` is a time of day: secondary, so it keeps the mono face but not the weight or the ink.
	const className = emphasis === 'count'
		? 'font-mono text-base leading-[1.2] font-medium text-foreground tabular-nums'
		: emphasis === 'total'
			? 'font-mono text-lg leading-6 font-medium text-foreground tabular-nums'
			: emphasis === 'clock'
				? 'font-mono font-normal text-muted-foreground tabular-nums'
				: 'font-mono font-medium text-foreground tabular-nums'
	return <span className={className}>{children}</span>
}

/** One fact of a data line. `count` leads, `time` follows and `total` closes it; `clock` is a time of day; `text` is plain words. */
export interface DataFact {
	kind?: 'text' | 'count' | 'time' | 'total' | 'clock'
	value: ReactNode
	/** The word after a figure ("items", "photos"). */
	unit?: string
}

function renderFact({ kind = 'text', value, unit }: DataFact) {
	const figure = kind === 'text' ? value : <DataFigure emphasis={kind === 'time' ? 'default' : kind}>{value}</DataFigure>
	return unit ? <>{figure} {unit}</> : figure
}

/** The data line of a page header and of a sheet header: the same facts look the same wherever they appear. Empty entries are skipped. */
export function DataFacts({ facts, testId }: { facts: Array<DataFact | null | false | undefined>; testId?: string }) {
	const visible = facts.filter((fact): fact is DataFact => Boolean(fact))
	return (
		<DataLine testId={testId}>
			{visible.map((fact, index) => (
				<Fragment key={index}>{renderFact(fact)}</Fragment>
			))}
		</DataLine>
	)
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
			className='text-sm leading-[1.2] text-muted-foreground dark:text-muted-foreground'
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
