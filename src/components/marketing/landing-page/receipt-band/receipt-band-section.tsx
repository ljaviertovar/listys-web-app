import { ArrowRight02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { MonoLabel, SectionWrapper } from '../commons'
import { TripRowMock, type TripRowMockData } from '../mockups'

import { cn } from '@/utils'

type Pair = { raw: string; rawPrice: string; row: TripRowMockData }

const PAIRS: Pair[] = [
	{
		raw: 'LECHE 2% 4L',
		rawPrice: '6.29',
		row: {
			quantity: 4,
			unit: 'L',
			name: '2% milk',
			note: 'Get the lactose-free one if they have it, the usual is fine',
			store: 'Market Fresh',
			alsoAt: 'also at No Frills',
			price: 6.29,
		},
	},
	{
		raw: 'CHERRY TOM 1KG',
		rawPrice: '3.75',
		row: { quantity: 1, unit: 'kg', name: 'Cherry tomatoes', store: 'Market Fresh', price: 3.75 },
	},
	{
		raw: 'FR RANGE EGGS 12',
		rawPrice: '4.80',
		row: {
			quantity: 12,
			unit: 'unit',
			name: 'Free-range eggs',
			note: 'Brown, not the white ones. Last time they were cracked',
			store: 'Market Fresh',
			alsoAt: 'also at No Frills',
			price: 4.8,
		},
	},
	{
		raw: 'CHKN BREAST 1KG',
		rawPrice: '12.30',
		row: {
			quantity: 1,
			unit: 'kg',
			name: 'Chicken breast',
			note: 'Skinless, it’s for Sunday’s stir-fry',
			store: 'Market Fresh',
			price: 12.3,
		},
	},
]

const PAIR_COLUMNS = 'md:grid-cols-[minmax(0,1fr)_34px_minmax(0,1.15fr)]'

/** The dark band: what a receipt prints next to the list row Listys makes of it. */
export function ReceiptBandSection() {
	return (
		<SectionWrapper
			testId='landing-receipt-band'
			surface='night'
			rhythm='band'
		>
			<div className='grid gap-[26px] md:gap-11 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-center lg:gap-18 [&>*]:min-w-0'>
				<div data-reveal>
					<h2 className='text-[34px] leading-[0.98] font-extrabold tracking-[-0.045em] text-white md:text-[clamp(34px,4.4vw,58px)]'>
						Receipts are written for the till. <em className='text-inverse-action not-italic'>Your list is written for you.</em>
					</h2>
					<p className='mt-4 max-w-[30em] text-base leading-relaxed md:mt-[22px] md:text-lg'>
						Listys reads each printed line into a name, a quantity and a price, and matches it to what is already on your list.
					</p>
				</div>
				<div data-reveal>
					<div className={cn('mb-3 hidden gap-x-3', PAIR_COLUMNS, 'md:grid')}>
						<MonoLabel tone='on-dark-muted'>On the receipt</MonoLabel>
						<MonoLabel
							tone='on-dark-muted'
							className='col-start-3'
						>
							In your list
						</MonoLabel>
					</div>
					<div
						aria-hidden='true'
						inert
						className='flex flex-col gap-4 md:gap-2.5'
					>
						{PAIRS.map((pair, index) => (
							<div
								key={pair.raw}
								className={cn(
									'group/pair grid grid-cols-1 items-center md:gap-3',
									PAIR_COLUMNS,
									index === PAIRS.length - 1 && 'max-md:hidden',
								)}
							>
								<div className='flex justify-between gap-3.5 rounded-t-xl border border-b-0 border-dashed border-night-line px-3.5 py-[11px] font-mono text-[12.5px] tracking-[0.03em] text-night-text transition-colors group-hover/pair:border-sky-400 group-hover/pair:text-white md:rounded-xl md:border-b md:px-4 md:py-3.5 md:text-[13.5px]'>
									<span className='min-w-0 truncate'>{pair.raw}</span>
									<span>{pair.rawPrice}</span>
								</div>
								<span className='hidden justify-center text-night-muted/60 transition-[color,transform] duration-200 group-hover/pair:translate-x-[3px] group-hover/pair:text-sky-400 md:flex'>
									<HugeiconsIcon
										icon={ArrowRight02Icon}
										strokeWidth={1.8}
										className='size-[22px]'
									/>
								</span>
								<div className='overflow-hidden rounded-b-[14px] bg-card text-card-foreground shadow-lg md:rounded-[14px]'>
									<TripRowMock
										{...pair.row}
										checkbox='none'
										testId={`landing-receipt-band-row-${index}`}
									/>
								</div>
							</div>
						))}
					</div>
					<p
						aria-hidden='true'
						className='mt-4 flex items-center gap-2.5 rounded-2xl border border-night-line bg-night-raised px-3.5 py-3 text-sm font-semibold text-white shadow-lg'
					>
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-[18px] shrink-0 text-green-400'
						/>
						9 items added to “Pantry” · 3 were already there
					</p>
				</div>
			</div>
		</SectionWrapper>
	)
}
