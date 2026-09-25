import type { ReactNode } from 'react'

import { Icon } from './landing-icons'
import { Pill, Row, Rows } from './list-rows'
import { Shell } from './shell'

import { cn } from '@/utils'

type Step = {
	num: string
	title: string
	lede: string
	points: string[]
	flip?: boolean
	visual: ReactNode
}

const REVIEW_LINES = [
	{ qty: '1 box', name: 'organic strawberries', price: '5.99' },
	{ qty: '1 L', name: 'almond milk', price: '4.50' },
	{ qty: '1 unit', name: 'sourdough bread', price: '5.25' },
	{ qty: '3 unit', name: 'avocados', price: '4.99' },
	{ qty: '500 g', name: 'greek yogurt', price: '6.50' },
]

const STEPS: Step[] = [
	{
		num: '01',
		title: 'Photograph the receipt',
		lede: 'Up to five images in one upload — the one in your pocket, the one that has been in a drawer for a month. Listys reads them in the background, so you can put the phone down.',
		points: [
			'Up to five photos in a single upload',
			'Extraction runs while you do something else',
			'Nothing is saved until you have looked at it',
		],
		flip: true,
		visual: (
			<div
				className='aspect-[16/10] rounded-[14px] bg-slate-100 bg-[url(/images/landing/aisle-cart.jpg)] bg-cover bg-center'
				role='img'
				aria-label='A shopper pushing a full grocery cart down a supermarket aisle, both hands on the handle.'
			/>
		),
	},
	{
		num: '02',
		title: 'Keep it as a list you reuse',
		lede: 'You see every line before anything saves. Then it merges into a base list — the object you actually keep — matching repeats by name so one thing never becomes two rows.',
		points: [
			'Every name, quantity and price stays editable',
			'Repeats merge by name instead of stacking up',
			'We aim for 99% accuracy on a legible receipt',
		],
		visual: (
			<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
				<div className='border-b border-slate-200 px-[14px] py-[13px]'>
					<div className='flex items-start justify-between gap-[10px]'>
						<div>
							<div className='text-[13px] font-extrabold tracking-[-0.02em] text-slate-900'>Review extracted items</div>
							<div className='mt-1 font-mono text-[11px] text-slate-500'>12 items · Market Fresh · $70.58</div>
						</div>
						<Pill kind='edit'>Editing</Pill>
					</div>
				</div>
				<div className='flex flex-col gap-[9px] p-[13px]'>
					{REVIEW_LINES.map(line => (
						<div
							key={line.name}
							className='flex items-center gap-[10px] rounded-[9px] border border-slate-300 bg-white px-[10px] py-2'
						>
							<span className='rounded-md bg-blue-100 px-[7px] py-[3px] font-mono text-[10.5px] font-semibold whitespace-nowrap text-blue-700'>
								{line.qty}
							</span>
							<span className='min-w-0 flex-1 truncate text-[12.5px] font-[650] text-slate-900'>{line.name}</span>
							<span className='font-mono text-[10.5px] text-slate-500 tabular-nums'>{line.price}</span>
						</div>
					))}
					<span className='font-mono text-[10px] text-slate-500'>+ 7 more lines to check</span>
				</div>
				<div className='flex gap-[9px] border-t border-slate-200 px-[13px] pt-[11px] pb-[13px]'>
					<span className='h-[34px] flex-1 rounded-[9px] bg-primary text-center text-[11.5px] leading-[34px] font-bold whitespace-nowrap text-white'>
						Merge into base list
					</span>
					<span className='flex-none rounded-[9px] border border-slate-300 bg-white px-[14px] text-[11.5px] leading-[32px] font-semibold whitespace-nowrap text-slate-700'>
						Discard
					</span>
				</div>
			</div>
		),
	},
	{
		num: '03',
		title: 'Shop it, and it gets better',
		lede: 'Starting a trip clones the list, so the original survives whatever happens in the store. Check items off one-handed, finish, and the trip feeds back into the list.',
		points: [
			'The trip is a clone — your base list is untouched',
			'Items arrive ordered by what you buy most',
			'Sync the trip back when you are done',
		],
		flip: true,
		visual: (
			<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
				<div className='border-b border-slate-200 px-[14px] py-[13px]'>
					<div className='flex items-start justify-between gap-[10px]'>
						<div>
							<div className='text-[13px] font-extrabold tracking-[-0.02em] text-slate-900'>Weekly household</div>
							<div className='mt-1 font-mono text-[11px] text-slate-500'>Progress: 7 of 12 items</div>
						</div>
						<Pill kind='live'>Shopping</Pill>
					</div>
					<div className='mt-[10px] h-[6px] overflow-hidden rounded-full bg-slate-100'>
						<i
							className='block h-full rounded-full bg-primary'
							style={{ width: '58%' }}
						/>
					</div>
				</div>
				<div className='flex flex-col gap-[9px] p-[13px]'>
					<div className='mb-[9px]'>
						<div className='text-[11.5px] font-extrabold tracking-[-0.005em] text-slate-900 uppercase'>Produce</div>
						<div className='mt-[2px] font-mono text-[9px] tracking-[.09em] text-slate-500 uppercase'>4 items · 3 checked</div>
					</div>
					<Rows>
						<Row
							chip='1 box'
							name='organic strawberries'
							checked
							done
						/>
						<Row
							chip='3 unit'
							name='avocados'
							checked
							done
						/>
						<Row
							chip='1 kg'
							name='cherry tomatoes'
							checked={false}
						/>
					</Rows>
					<div className='mt-[6px] mb-[9px]'>
						<div className='text-[11.5px] font-extrabold tracking-[-0.005em] text-slate-900 uppercase'>Dairy</div>
						<div className='mt-[2px] font-mono text-[9px] tracking-[.09em] text-slate-500 uppercase'>3 items · 2 checked</div>
					</div>
					<Rows>
						<Row
							chip='1 L'
							name='almond milk'
							checked
							done
						/>
					</Rows>
				</div>
				<div className='flex gap-[9px] border-t border-slate-200 px-[13px] pt-[11px] pb-[13px]'>
					<span className='h-[34px] flex-1 rounded-[9px] bg-primary text-center text-[11.5px] leading-[34px] font-bold whitespace-nowrap text-white'>
						Complete shopping
					</span>
					<span className='flex-none rounded-[9px] border border-slate-300 bg-white px-[14px] text-[11.5px] leading-[32px] font-semibold whitespace-nowrap text-slate-700'>
						Cancel
					</span>
				</div>
			</div>
		),
	},
]

export function HowItWorks() {
	return (
		<section
			id='how-it-works'
			data-testid='landing-how-it-works'
			className='section-divider scroll-mt-16 overflow-hidden bg-white py-[72px] min-[900px]:py-[104px]'
		>
			<Shell>
				<div className='mb-[34px] grid gap-4 min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-[60px]'>
					<h2 className='text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-extrabold text-slate-900 text-balance'>
						Photograph a receipt. Shop from the list. Repeat.
					</h2>
					<p className='max-w-[34em] text-base leading-[1.6] text-slate-600 min-[900px]:pt-[7px]'>
						The receipt is how the list gets fed. The list is what you actually use — and it starts closer to done
						after every trip.
					</p>
				</div>
				<div className='mt-14 flex flex-col gap-[88px] min-[980px]:mt-[84px] min-[980px]:gap-[136px]'>
					{STEPS.map(step => (
						<article
							key={step.num}
							className='grid items-center gap-[34px] min-[980px]:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] min-[980px]:gap-[76px]'
						>
							<div className={cn('min-[980px]:order-1', step.flip && 'min-[980px]:order-2')}>
								<span className='mb-4 inline-block font-mono text-xs font-semibold tracking-[.14em] text-primary'>
									{step.num}
								</span>
								<h3 className='text-[clamp(24px,3vw,34px)] leading-[1.1] font-extrabold tracking-[-0.03em] text-slate-900 text-balance'>
									{step.title}
								</h3>
								<p className='mt-4 max-w-[40em] text-base leading-[1.66] text-slate-600'>{step.lede}</p>
								<ul className='mt-[26px] flex flex-col gap-[13px]'>
									{step.points.map(point => (
										<li
											key={point}
											className='flex items-start gap-3 text-[15px] leading-[1.5] text-slate-700'
										>
											<i className='mt-px flex size-[21px] shrink-0 items-center justify-center rounded-[7px] bg-blue-100 text-blue-700 [&_svg]:size-[11px]'>
												<Icon id='tick' />
											</i>
											<span>{point}</span>
										</li>
									))}
								</ul>
							</div>
							<div
								className={cn(
									'min-[980px]:order-2 min-[980px]:-mr-[84px]',
									step.flip && 'min-[980px]:order-1 min-[980px]:mr-0 min-[980px]:-ml-[84px]',
								)}
								aria-hidden='true'
							>
								<div className='overflow-hidden rounded-[20px] border border-slate-200 bg-[#F4F8FF] p-[22px] min-[980px]:p-[30px]'>
									{step.visual}
								</div>
							</div>
						</article>
					))}
				</div>
			</Shell>
		</section>
	)
}
