import { cn } from '@/utils'

export type LearnListEntry = {
	/** The one-character printed mark ("%", "∑", "#"). */
	mark: string
	title: string
	text: string
}

type LearnListProps = {
	entries: LearnListEntry[]
	testId: string
	/** External layout only (margins). */
	className?: string
}

/** A short printed list of what Listys keeps or works out, one ruled line per entry. */
export function LearnList({ entries, testId, className }: LearnListProps) {
	return (
		<ul
			data-testid={testId}
			className={cn('border-t-[1.5px] border-paper-ink', className)}
		>
			{entries.map(entry => (
				<li
					key={entry.title}
					className='grid grid-cols-[22px_minmax(0,1fr)] gap-x-2.5 gap-y-1 border-b-[1.5px] border-dashed border-paper-line py-3 md:grid-cols-[44px_minmax(0,1fr)] md:gap-x-3 md:py-4'
				>
					<span
						aria-hidden='true'
						className='pt-0.5 font-mono text-[13px] font-medium text-primary md:text-xs'
					>
						{entry.mark}
					</span>
					<div>
						<b className='block text-[15.5px] text-paper-ink md:text-[16.5px]'>{entry.title}</b>
						<span className='text-[15px] leading-normal md:text-[15.5px]'>{entry.text}</span>
					</div>
				</li>
			))}
		</ul>
	)
}
