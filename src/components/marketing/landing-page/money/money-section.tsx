import { LearnList, MonoLabel, SectionHead, SectionWrapper, type LearnListEntry } from '../commons'
import { PricesByStoreMock, SpendMonthMock } from '../mockups'

const LEARNS: LearnListEntry[] = [
	{
		mark: '%',
		title: 'Where it is cheaper',
		text: 'Each item keeps the last price at every store you bought it, per unit too, and marks the cheapest.',
	},
	{
		mark: '∑',
		title: 'What a month costs',
		text: 'Spend by store and by category, with the change from the month before and the average receipt.',
	},
	{
		mark: '↻',
		title: 'How you shop',
		text: 'How many times you bought an item, the days between trips and the last time, so habits show up on their own.',
	},
]

// A deeper drop under the two app cards so they read as screens lifted off the paper.
const LIFT = 'rounded-4xl shadow-xl'

/** 01 — What the receipts add up to: an item's prices by store, and the month's spending on the dashboard. */
export function MoneySection() {
	return (
		<SectionWrapper
			id='prices'
			testId='landing-money'
		>
			<div data-reveal>
				<SectionHead
					number='01 — What it adds up to'
					title={
						<>
							Know what it costs, and <span className='text-primary'>where it costs less.</span>
						</>
					}
					description='Every receipt you keep is also a price list. Listys adds them up into what each month costs, where the money goes, and which store sells each item for less.'
					testId='landing-money-head'
				/>
			</div>
			<div className='grid items-start gap-10 md:grid-cols-2 min-[67.5rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.82fr)] min-[67.5rem]:gap-8 [&>*]:min-w-0'>
				<div
					data-reveal
					className='relative mb-10 md:mb-0'
				>
					<MonoLabel
						as='p'
						className='mb-2.5 px-1'
					>
						On every item
					</MonoLabel>
					<div
						aria-hidden='true'
						inert
						className='rounded-t-3xl rounded-b-[18px]'
					>
						<PricesByStoreMock />
					</div>
					<p
						data-testid='landing-money-stamp'
						className='absolute -bottom-[58px] right-3 z-10 flex rotate-4 flex-col gap-0.5 rounded-[14px] bg-primary px-3.5 py-3 text-primary-foreground shadow-lg md:right-7 md:-bottom-[62px]'
					>
						<MonoLabel
							size='xs'
							tone='on-accent'
						>
							Same dozen
						</MonoLabel>
						<b className='font-display text-[22px] leading-[1.05] tracking-[-0.02em]'>$0.51 less</b>
						<MonoLabel
							size='xs'
							tone='on-accent'
						>
							at No Frills
						</MonoLabel>
					</p>
				</div>
				<div
					data-reveal
					className='min-[67.5rem]:mt-16'
				>
					<MonoLabel
						as='p'
						className='mb-2.5 px-1'
					>
						On the dashboard
					</MonoLabel>
					<div
						aria-hidden='true'
						inert
						className={LIFT}
					>
						<SpendMonthMock />
					</div>
				</div>
				<div
					data-reveal
					className='md:col-span-2 min-[67.5rem]:col-span-1 min-[67.5rem]:mt-6'
				>
					<LearnList
						entries={LEARNS}
						testId='landing-money-learns'
					/>
					<p className='mt-5 text-[15.5px] leading-[1.55] text-paper-text'>
						Nothing is scraped or guessed: the more receipts you keep, the sharper it gets.
					</p>
					<MonoLabel
						as='p'
						className='mt-[22px]'
					>
						Illustrative data
					</MonoLabel>
				</div>
			</div>
		</SectionWrapper>
	)
}
