import type { ReactNode } from 'react'

import BackLink from '@/components/app/back-link'
import { TornPaper } from '@/components/commons/torn-paper'

interface Props {
	/** The receipt's name: the store it was read at, or its fallback name. */
	title: string
	back: { href: string; label: string }
	/** The receipt's status pill. */
	status: ReactNode
	/** When it was uploaded and bought. */
	dates: ReactNode
	/** What was read ("12 items", "5 categories", or the photo count when nothing could be read). */
	facts: string[]
	/** The recorded total of a read receipt, already formatted. */
	total?: string | null
}

const RULE = 'border-t-[1.5px] border-dashed border-paper-line dark:border-border'

/**
 * The header of a receipt's screen, printed as the receipt itself: the only place in the product where the paper is literal. It
 * keeps the screen header's slots (back link, title, status, facts); the lines under it are work and stay plain cards.
 */
export function ReceiptTicketHeader({ title, back, status, dates, facts, total }: Props) {
	return (
		<header
			data-testid='receipt-ticket-header'
			className='mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-5 pb-4 md:px-6 md:pt-6 lg:px-8'
		>
			<BackLink
				href={back.href}
				label={back.label}
				variant='screen'
			/>
			<TornPaper
				surface='card'
				testId='receipt-ticket'
				className='w-full max-w-xl'
			>
				<div className='flex items-start justify-between gap-3'>
					<h1 className='line-clamp-2 min-w-0 font-display text-2xl leading-7 font-extrabold tracking-[-0.03em] break-words'>{title}</h1>
					<div className='shrink-0 pt-0.5'>{status}</div>
				</div>
				<p className='mt-1.5 font-mono text-[11px] leading-5 tracking-[0.06em] text-muted-foreground uppercase'>{dates}</p>
				{facts.length > 0 ? (
					<p
						data-testid='receipt-ticket-facts'
						className={`mt-2.5 pt-2.5 font-mono text-xs tracking-[0.06em] uppercase ${RULE}`}
					>
						{facts.join(' · ')}
					</p>
				) : null}
				{total ? (
					<p
						data-testid='receipt-ticket-total'
						className={`mt-2.5 flex justify-between gap-3 pt-2.5 font-mono text-[15px] font-semibold tracking-[0.04em] tabular-nums ${RULE}`}
					>
						<span>TOTAL</span>
						<span>{total}</span>
					</p>
				) : null}
			</TornPaper>
		</header>
	)
}
