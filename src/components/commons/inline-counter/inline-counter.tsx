interface InlineCounterProps {
	count: number
	one: string
	many: string
	testId?: string
}

/**
 * Inline counter (canvas 4/7): the number in IBM Plex Mono beside its label in Inter grey, with no box and no colour, so it is never
 * taken for a status. The label follows the number ("1 receipt", "3 receipts").
 */
export function InlineCounter({ count, one, many, testId = 'inline-counter' }: InlineCounterProps) {
	return (
		<span
			data-testid={testId}
			className='inline-flex items-baseline gap-1.5 text-sm leading-none text-slate-600 dark:text-muted-foreground'
		>
			<b className='font-mono text-base font-semibold text-foreground tabular-nums'>{count}</b>
			{` ${count === 1 ? one : many}`}
		</span>
	)
}
