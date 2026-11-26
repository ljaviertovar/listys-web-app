import Image from 'next/image'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SessionSummaryCard } from '@/components/features/shopping-sessions'
import { cn } from '@/utils'

import { MonoLabel, SectionHead, SectionWrapper, TornPaper } from '../commons'

import { ReviewFragment } from './review-fragment'

type Step = {
	number: string
	verb: string
	title: string
	text: string
	footTerm: string
	footValue: string
	image: { src: string; alt: string }
	fragment: ReactNode
}

const STEPS: Step[] = [
	{
		number: '01',
		verb: 'Read',
		title: 'Photograph the receipt',
		text: 'Up to five photos in one upload. Listys reads them in the background, and the store name comes from the receipt itself.',
		footTerm: 'Photos',
		footValue: '1–5 / upload',
		image: {
			src: '/images/landing/step-01.webp',
			alt: 'A shopper photographing a grocery receipt with the Listys upload screen open on their phone.',
		},
		fragment: <UploadFragment />,
	},
	{
		number: '02',
		verb: 'Review',
		title: 'Confirm each match, then keep it',
		text: 'Listys compares every line with your list and suggests a match. Confirm it, choose another item, or add the line as new. Nothing joins the list until you tap Add or Update.',
		footTerm: 'Saved unreviewed',
		footValue: '0 lines',
		image: {
			src: '/images/landing/step-02.webp',
			alt: 'A shopper reviewing the items Listys read from a receipt, next to the paper receipt on a kitchen counter.',
		},
		fragment: <ReviewFragment />,
	},
	{
		number: '03',
		verb: 'Shop',
		title: 'Shop it, and the list learns',
		text: 'A trip is a copy of the list, so the original stays intact. Finishing the trip saves what you checked back into the list.',
		footTerm: 'Every finished trip',
		footValue: 'Updates the list',
		image: {
			src: '/images/landing/step-03.webp',
			alt: 'A shopper checking items off a Listys shopping trip while pushing a cart through the store.',
		},
		fragment: (
			<SessionSummaryCard
				mode='active'
				checked={11}
				total={12}
				estimate={{ total: 48.1, pricedCount: 9, itemCount: 11 }}
				testId='landing-step-03-progress'
			/>
		),
	},
]

/** 03 — How it works: three receipt tickets, one per step, each with the app screen that step happens on. */
export function HowItWorksSection() {
	return (
		<SectionWrapper
			id='how-it-works'
			testId='landing-how-it-works'
			contained={false}
		>
			<div className='mx-auto max-w-[1200px] px-5 md:px-8'>
				<div data-reveal>
					<SectionHead
						number='03 — How'
						title='Three steps the first time. After that, mostly the third.'
						description='The receipt is how the list gets fed. The list is what you actually use in the store.'
						testId='landing-how-head'
					/>
				</div>
			</div>
			<ol
				data-testid='landing-how-steps'
				className='mx-auto flex max-w-[1200px] snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pt-1 pb-[26px] [scrollbar-width:none] md:px-8 lg:grid lg:snap-none lg:grid-cols-3 lg:items-start lg:gap-7 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden'
			>
				{STEPS.map((step, index) => (
					<li
						key={step.number}
						data-reveal
						className={cn(
							'shrink-0 basis-[84%] snap-start sm:basis-[60%] lg:basis-auto',
							index === 1 && 'lg:mt-14',
							index === 2 && 'lg:mt-28',
						)}
					>
						<StepTicket step={step} />
					</li>
				))}
			</ol>
			<MonoLabel
				as='p'
				className='px-5 text-right lg:hidden'
			>
				Swipe →
			</MonoLabel>
		</SectionWrapper>
	)
}

/** One step as a torn ticket: its number, the photo, the app fragment overlapping the photo, the text and a printed footer line. */
function StepTicket({ step }: { step: Step }) {
	return (
		<TornPaper
			lift
			testId={`landing-step-${step.number}`}
		>
			<div className='mb-3 flex justify-between gap-2.5 border-b-[1.5px] border-dashed border-paper-line px-1 pt-1 pb-3'>
				<MonoLabel>
					Step <b className='font-semibold text-primary'>{step.number}</b>
				</MonoLabel>
				<MonoLabel>{step.verb}</MonoLabel>
			</div>
			<div className='relative aspect-4/3 overflow-hidden rounded-[10px]'>
				<Image
					src={step.image.src}
					alt={step.image.alt}
					fill
					sizes='(min-width: 1024px) 360px, 84vw'
					className='object-cover'
				/>
			</div>
			<div
				aria-hidden='true'
				inert
				className='relative z-10 mx-2 -mt-[46px] text-sm md:mx-2.5 md:-mt-[58px]'
			>
				{step.fragment}
			</div>
			<div className='px-1.5 pt-4 md:pt-[22px]'>
				<h3 className='text-[23px] leading-[1.05] font-extrabold tracking-[-0.035em] text-paper-ink md:text-[clamp(24px,2.3vw,30px)]'>
					{step.title}
				</h3>
				<p className='mt-2 text-[15px] leading-relaxed md:mt-2.5 md:text-base'>{step.text}</p>
				<div className='mt-3.5 flex justify-between gap-3 border-t-[1.5px] border-dashed border-paper-line pt-2.5 md:mt-5 md:pt-3'>
					<MonoLabel tone='ink'>{step.footTerm}</MonoLabel>
					<MonoLabel tone='accent'>{step.footValue}</MonoLabel>
				</div>
			</div>
		</TornPaper>
	)
}

/** Step 01: a receipt photo in the Receipts list while Listys reads it. */
function UploadFragment() {
	return (
		<Card size='tight'>
			<div className='flex items-center gap-3'>
				<span className='relative flex h-14 w-11 shrink-0 flex-col gap-1 overflow-hidden rounded-lg bg-card px-1.5 py-[7px] ring-1 ring-border'>
					{[100, 70, 100, 55, 100].map((width, index) => (
						<i
							key={index}
							className='block h-0.5 rounded-[1px] bg-slate-300'
							style={{ width: `${width}%` }}
						/>
					))}
					<span className='absolute inset-x-0 top-[55%] h-0.5 bg-linear-to-r from-transparent via-sky-400 to-transparent shadow-sm shadow-sky-400/40' />
				</span>
				<div className='min-w-0 flex-1'>
					<div className='text-sm font-semibold'>Market Fresh</div>
					<div className='text-[12.5px] text-muted-foreground'>1 photo · 24 May</div>
				</div>
				<Badge
					variant='processing'
					dot
				>
					Reading
				</Badge>
			</div>
		</Card>
	)
}
