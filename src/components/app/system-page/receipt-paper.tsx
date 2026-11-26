import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils'

export type ReceiptPaperVariant = 'feed' | 'stopped' | 'missing'

interface ReceiptPaperProps {
	/**
	 * feed: it prints while the app loads. stopped: the same paper after a failure, with a torn edge and a missing price.
	 * missing: whole and still, with one line that is not there (the page was not found).
	 */
	variant: ReceiptPaperVariant
	testId: string
}

// Checkbox and name bar widths that repeat every four rows; the feed moves exactly four rows per loop.
const ROW_PATTERN = [
	{ checked: true, name: 'w-[62%]' },
	{ checked: true, name: 'w-[43%]' },
	{ checked: false, name: 'w-[62%]' },
	{ checked: true, name: 'w-[34%]' },
] as const

const FEED_ROWS = Array.from({ length: 16 }, (_, index) => ROW_PATTERN[index % ROW_PATTERN.length])

// Rows are ruled with the perforation's dashes; the bars are ink at low strength.
const ROW_RULE = 'border-b border-dashed border-paper-line last:border-b-0 dark:border-border'
const BAR = 'bg-paper-ink/14 dark:bg-muted-foreground/20'

// Zig-zag teeth of the torn edge, 20 of them across the 200px paper.
const TORN_FILL = 'M0 0V2L10 7L20 2L30 7L40 2L50 7L60 2L70 7L80 2L90 7L100 2L110 7L120 2L130 7L140 2L150 7L160 2L170 7L180 2L190 7L199.5 2V0Z'
const TORN_LINE = 'M0.5 0V2L10 7L20 2L30 7L40 2L50 7L60 2L70 7L80 2L90 7L100 2L110 7L120 2L130 7L140 2L150 7L160 2L170 7L180 2L190 7L199.5 2V0'

// The paper is a presentational illustration: the page that shows it carries the meaning, so it is hidden from assistive tech.
export function ReceiptPaper({ variant, testId }: ReceiptPaperProps) {
	if (variant === 'feed') {
		return (
			<div
				aria-hidden='true'
				data-testid={testId}
				className='relative h-40 w-50 overflow-hidden bg-card ring-1 ring-paper-ink/13 dark:ring-border dark:bg-muted [mask-image:linear-gradient(to_bottom,transparent,black_18px,black_58%,transparent)]'
			>
				<div className='absolute inset-x-0 -top-28 animate-receipt-feed motion-reduce:animate-none'>
					{FEED_ROWS.map((row, index) => (
						<PaperRow key={index} checked={row.checked} name={row.name} />
					))}
				</div>
			</div>
		)
	}

	if (variant === 'stopped') {
		return (
			<div aria-hidden='true' data-testid={testId} className='relative w-50 drop-shadow-sm'>
				<div className='border border-b-0 border-paper-ink/13 bg-card pt-3.5 pb-1 dark:border-border dark:bg-muted [mask-image:linear-gradient(to_bottom,transparent,black_18px)]'>
					<PaperRow checked name='w-[62%]' />
					<PaperRow checked name='w-[43%]' />
					<div className='flex h-7 items-center gap-2 px-3.5'>
						<PaperCheckbox />
						<span className={cn('h-1.5 w-[34%] rounded-full', BAR)} />
						<span className='ml-auto font-mono text-sm leading-none font-medium text-feedback-warning'>—</span>
					</div>
				</div>
				<svg viewBox='0 0 200 8' className='block h-2 w-50' fill='none'>
					<path d={TORN_FILL} className='fill-card dark:fill-muted' />
					<path d={TORN_LINE} className='stroke-paper-ink/13 dark:stroke-border' />
				</svg>
				<PaperBadge tone='error' className='-right-8 -bottom-5'>
					<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.6} className='size-5.5' />
				</PaperBadge>
			</div>
		)
	}

	return (
		<div aria-hidden='true' data-testid={testId} className='relative w-50 drop-shadow-sm'>
			<div className='bg-card pt-3.5 pb-2.5 ring-1 ring-paper-ink/13 dark:ring-border dark:bg-muted [mask-image:linear-gradient(to_bottom,transparent,black_18px,black_70%,transparent)]'>
				<PaperRow checked name='w-[62%]' />
				<PaperRow checked name='w-[43%]' />
				<div className={cn('flex h-7 items-center gap-2 px-3.5', ROW_RULE)}>
					<PaperCheckbox />
					<span className='h-2 w-[44%] rounded-sm border border-dashed border-paper-muted dark:border-muted-foreground' />
					<span className='ml-auto font-mono text-sm leading-none font-medium text-primary dark:text-blue-300'>404</span>
				</div>
				<PaperRow checked name='w-[34%]' />
			</div>
			<PaperBadge tone='info' className='top-15.25 -right-9.5'>
				<HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} className='size-5' />
			</PaperBadge>
		</div>
	)
}

interface PaperRowProps {
	checked: boolean
	/** Width class of the name bar. */
	name: string
}

function PaperRow({ checked, name }: PaperRowProps) {
	return (
		<div className={cn('flex h-7 items-center gap-2 px-3.5', ROW_RULE)}>
			<PaperCheckbox checked={checked} />
			<span className={cn('h-1.5 rounded-full', BAR, name)} />
			<span className={cn('ml-auto h-1.5 w-5.5 rounded-full', BAR)} />
		</div>
	)
}

// A box that is not checked is still to be printed: it is drawn in dashes.
function PaperCheckbox({ checked = false }: { checked?: boolean }) {
	return (
		<span
			className={cn(
				'flex size-3 shrink-0 items-center justify-center rounded-[4px] border',
				checked ? 'border-primary bg-primary text-primary-foreground dark:border-blue-400 dark:bg-blue-400 dark:text-background' : 'border-dashed border-paper-muted/70 dark:border-muted-foreground',
			)}
		>
			{checked ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={3.2} className='size-2.25' /> : null}
		</span>
	)
}

interface PaperBadgeProps {
	tone: 'error' | 'info'
	className: string
	children: ReactNode
}

// The ring is the colour of the page ground, so the badge looks cut out of the paper.
function PaperBadge({ tone, className, children }: PaperBadgeProps) {
	return (
		<span className={cn('absolute flex size-11.5 items-center justify-center rounded-full bg-muted dark:bg-sidebar', className)}>
			<span
				className={cn(
					'flex size-9.5 items-center justify-center rounded-full',
					tone === 'error' ? 'bg-feedback-error-tint text-feedback-error' : 'bg-entity-list text-entity-list-on',
				)}
			>
				{children}
			</span>
		</span>
	)
}
