import { ArrowRight02Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

import { ButtonLink, MonoLabel, Shell } from '../commons'
import { HeroPhone, ReceiptPaper } from '../mockups'

import { cn } from '@/utils'

type TallyLine = { term: string; value: string }

// The desktop tally prints one benefit per dotted line; the phone layout packs the same facts into a 2×2 strip.
const TALLY: TallyLine[] = [
	{ term: 'Credit card', value: 'Not needed' },
	{ term: 'Cheapest store', value: 'Marked on each item' },
	{ term: 'Shared with', value: 'Your household' },
]
const TALLY_TOTAL: TallyLine = { term: 'Items added without your review', value: '0' }

const TALLY_COMPACT: TallyLine[] = [
	{ term: 'Credit card', value: 'Not needed' },
	{ term: 'Cheapest store', value: 'On each item' },
	{ term: 'Shared with', value: 'Your household' },
	{ term: 'Added without your review', value: '0 items' },
]

// Load choreography: the copy rises in order, then the receipt and the phone slide in.
const RISE = 'animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none'

/** The first screen: the promise, the call to action, the tally of what it costs, and a receipt turning into a running trip. */
export function HeroSection() {
	return (
		<section
			data-testid='landing-hero'
			className='pt-[22px] md:pt-9 md:pb-[72px] min-[66.25rem]:pt-14 min-[66.25rem]:pb-24'
		>
			<Shell
				testId='landing-hero-shell'
				className='grid items-start gap-6 md:gap-12 min-[66.25rem]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] min-[66.25rem]:gap-10 [&>*]:min-w-0'
			>
				<div>
					<p
						className={cn(
							'flex max-w-[640px] flex-wrap gap-x-[18px] gap-y-1.5 border-b-[1.5px] border-dashed border-paper-line pb-3 md:border-paper-ink md:pb-[18px]',
							RISE,
							'delay-50',
						)}
					>
						<MonoLabel size='sm'>Receipt → list</MonoLabel>
						<MonoLabel size='sm'>No. 0001</MonoLabel>
						<MonoLabel
							size='sm'
							className='ml-auto'
						>
							Free
						</MonoLabel>
					</p>
					<h1
						className={cn(
							'mt-[22px] max-w-[11ch] text-[46px] leading-[0.94] font-extrabold tracking-[-0.045em] text-paper-ink md:mt-7 md:text-[clamp(50px,7.6vw,104px)] md:tracking-[-0.038em]',
							RISE,
							'delay-150',
						)}
					>
						Never write the same shopping list <span className='hero-strike'>twice.</span>
					</h1>
					<p
						className={cn(
							'mt-4 max-w-[31em] text-[16.5px] leading-[1.55] text-paper-text md:mt-7 md:text-[clamp(18px,1.7vw,21px)]',
							RISE,
							'delay-250',
						)}
					>
						Photograph a receipt you already have. Listys reads the items so you can review them and choose what to add to a
						reusable list.
					</p>
					<div
						className={cn(
							'mt-[22px] flex flex-col items-stretch gap-1 md:mt-8 md:flex-row md:flex-wrap md:items-center md:gap-x-[26px] md:gap-y-3',
							RISE,
							'delay-350',
						)}
					>
						<ButtonLink
							href='/auth/signup'
							size='2xl'
							testId='landing-hero-cta'
							className='w-full md:w-auto'
						>
							Create free account
							<HugeiconsIcon
								icon={ArrowRight02Icon}
								strokeWidth={2}
								data-icon='inline-end'
							/>
						</ButtonLink>
						<Link
							href='#how-it-works'
							data-testid='landing-hero-how-link'
							className='focus-ring flex min-h-11 items-center justify-center gap-2 rounded-md border-b-[1.5px] border-transparent pt-0.5 font-semibold text-paper-ink transition-colors hover:border-paper-ink md:min-h-12'
						>
							See how it works
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								strokeWidth={2}
								className='size-3.5'
							/>
						</Link>
					</div>

					<dl
						data-testid='landing-hero-tally'
						className={cn('mt-10 hidden max-w-[460px] font-mono text-[13px] text-paper-text md:block', RISE, 'delay-450')}
					>
						{TALLY.map(line => (
							<TallyRow
								key={line.term}
								line={line}
							/>
						))}
						<TallyRow
							line={TALLY_TOTAL}
							total
						/>
					</dl>
					<dl
						data-testid='landing-hero-tally-compact'
						className={cn('mt-3.5 grid grid-cols-2 border-y-[1.5px] border-paper-ink md:hidden', RISE, 'delay-450')}
					>
						{TALLY_COMPACT.map((line, index) => (
							<div
								key={line.term}
								className={cn(
									'px-1.5 py-[9px] text-center',
									index % 2 === 1 && 'border-l-[1.5px] border-dashed border-paper-line',
									index > 1 && 'border-t-[1.5px] border-dashed border-paper-line',
								)}
							>
								<dt className='font-mono text-[9.5px] tracking-[0.1em] text-paper-muted uppercase'>{line.term}</dt>
								<dd
									className={cn(
										'mt-[3px] font-mono text-[13px] font-semibold uppercase',
										index === TALLY_COMPACT.length - 1 ? 'text-primary' : 'text-paper-ink',
									)}
								>
									{line.value}
								</dd>
							</div>
						))}
					</dl>
				</div>

				<HeroStage />
			</Shell>
		</section>
	)
}

type TallyRowProps = {
	line: TallyLine
	/** The ruled last line, its value in blue. */
	total?: boolean
}

/** One dotted line of the tally: the term, the leader dots and the value, as a receipt prints them. */
function TallyRow({ line, total = false }: TallyRowProps) {
	return (
		<div
			className={cn(
				'flex items-baseline gap-2.5 py-[7px]',
				total && 'mt-1.5 border-t-[1.5px] border-paper-ink pt-3',
			)}
		>
			<dt className='tracking-[0.06em] uppercase'>{line.term}</dt>
			<i
				aria-hidden='true'
				className='flex-1 -translate-y-1 border-b-[1.5px] border-dotted border-paper-muted/50'
			/>
			<dd className={cn('font-semibold uppercase', total ? 'text-primary' : 'text-paper-ink')}>{line.value}</dd>
		</div>
	)
}

/**
 * The receipt and the phone. On a phone they are cropped into a short, fading strip under the copy; from `md` they stand at full
 * size, the receipt tilted behind the phone.
 */
function HeroStage() {
	return (
		<div
			data-testid='landing-hero-stage'
			className='relative -mx-5 h-[330px] overflow-hidden mask-[linear-gradient(#000_62%,transparent)] md:mx-0 md:flex md:h-auto md:min-h-[700px] md:justify-center md:overflow-visible md:mask-none'
		>
			<p className='absolute top-0 left-5 z-30 flex items-center gap-2 md:hidden'>
				<span className='size-[7px] rounded-full bg-sky-400 ring-3 ring-sky-400/25' />
				<MonoLabel
					size='sm'
					tone='accent'
				>
					Read from Market Fresh · 12 items
				</MonoLabel>
			</p>
			<p className='sr-only'>
				A phone showing the twelve items from that receipt as a shopping trip in progress, three of twelve collected.
			</p>
			<div
				aria-hidden='true'
				inert
				className='absolute top-10 -left-[34px] z-10 w-[262px] origin-top-left scale-80 -rotate-[7deg] md:top-1.5 md:left-[calc(50%-300px)] md:scale-100 md:-rotate-6 min-[66.25rem]:-left-[26px]'
			>
				<div className='animate-in fade-in slide-in-from-bottom-8 slide-in-from-left-8 fill-mode-both delay-200 duration-1100 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none'>
					<ReceiptPaper />
				</div>
			</div>
			<div
				aria-hidden='true'
				inert
				className='absolute top-[30px] -right-[18px] z-20 origin-top-right scale-[0.82] rotate-4 md:relative md:top-auto md:right-auto md:mt-[58px] md:translate-x-[120px] md:scale-100 md:rotate-2 min-[66.25rem]:translate-x-[70px]'
			>
				<div className='animate-in fade-in slide-in-from-bottom-10 slide-in-from-right-8 fill-mode-both delay-350 duration-1100 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none'>
					<HeroPhone />
				</div>
			</div>
		</div>
	)
}
