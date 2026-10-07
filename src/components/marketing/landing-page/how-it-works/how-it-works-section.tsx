import type { ReactNode } from 'react'
import Image from 'next/image'

import { Icon } from '../commons'

import { cn } from '@/utils'

type Step = {
	num: string
	title: string
	lede: string
	points: string[]
	flip?: boolean
	visual: ReactNode
}

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
			<Image
				src='/images/landing/step-01.webp'
				alt='A shopper photographing a grocery receipt beside a cart of groceries.'
				width={724}
				height={543}
				className='h-auto w-full rounded-[14px] shadow'
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
			<Image
				src='/images/landing/step-02.webp'
				alt='A shopper checking groceries off a reusable Listys shopping list on their phone.'
				width={724}
				height={543}
				className='h-auto w-full rounded-[14px] shadow'
			/>
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
			<Image
				src='/images/landing/step-03.webp'
				alt='A shopper using Listys to find groceries while pushing a full cart through the store.'
				width={724}
				height={543}
				className='h-auto w-full rounded-[14px] shadow'
			/>
		),
	},
]

export function HowItWorksSection() {
	return (
		<div
			data-testid='landing-how-it-works'
			className='w-full'
		>
			<div className='mb-[34px] grid gap-4 min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-[60px]'>
				<h2 className='text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-extrabold text-slate-900 text-balance'>
					Photograph a receipt. Shop from the list. Repeat.
				</h2>
				<p className='max-w-[34em] text-base leading-[1.6] text-slate-600 min-[900px]:pt-[7px]'>
					The receipt is how the list gets fed. The list is what you actually use — and it starts closer to done after
					every trip.
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
						<div className={cn('min-[980px]:order-2', step.flip && 'min-[980px]:order-1')}>
							<div className='overflow-hidden rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,#F4F8FF_0%,#fff_100%)] p-[22px] min-[980px]:p-[30px]'>
								{step.visual}
							</div>
						</div>
					</article>
				))}
			</div>
		</div>
	)
}
