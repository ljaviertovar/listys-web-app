import { HugeiconsIcon } from '@hugeicons/react'
import { CardFooter } from '../ui/card'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

interface Props {
	count: number
	coutLabel: string
	linkText: string
}

export default function CardFooterContent({ count, coutLabel, linkText }: Props) {
	return (
		<CardFooter className='px-4'>
			<div className='w-full flex items-baseline justify-between border-t border-border/40 pt-2'>
				<div className='flex items-baseline gap-1'>
					<span className='text-lg font-bold text-foreground tabular-nums tracking-tight'>{count}</span>
					<span className='text-xs font-bold tracking-widest text-primary/60'>{coutLabel}</span>
				</div>

				<div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary'>
					<span>{linkText}</span>
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						strokeWidth={2.5}
						className='h-3 w-3 transition-transform group-hover:translate-x-0.5'
					/>
				</div>
			</div>
		</CardFooter>
	)
}
