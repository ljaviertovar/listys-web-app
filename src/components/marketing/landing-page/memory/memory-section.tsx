import { LearnList, MonoLabel, SectionHead, SectionWrapper, type LearnListEntry } from '../commons'

import { TripCompare } from './trip-compare'

const LEARNS: LearnListEntry[] = [
	{
		mark: '#',
		title: 'Your items, in your words',
		text: 'Clean names, quantities and your notes stay on each item, trip after trip.',
	},
	{
		mark: '!',
		title: 'What is about to run out',
		text: 'After three receipts, the dashboard suggests what you usually buy and is due again.',
	},
	{
		mark: '↺',
		title: 'Every trip, kept',
		text: 'Finished trips stay in history, so nothing you bought gets lost.',
	},
]

/** 02 — What it remembers: the same list on its first trip and a few receipts later. */
export function MemorySection() {
	return (
		<SectionWrapper
			id='what-it-remembers'
			testId='landing-memory'
			surface='sunken'
		>
			<div className='grid items-start gap-[26px] md:gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 [&>*]:min-w-0'>
				<div
					data-reveal
					className='lg:sticky lg:top-24'
				>
					<SectionHead
						layout='stack'
						titleSize='lg'
						number='02 — What it remembers'
						title={
							<>
								Every trip starts where the <span className='text-primary'>last one</span> left off.
							</>
						}
						description='There is nothing to set up and no number of trips to reach. Each receipt and each finished trip adds to the list, so every shop starts closer to done than the one before.'
						testId='landing-memory-head'
					/>
					<LearnList
						entries={LEARNS}
						testId='landing-memory-learns'
						className='mt-[34px] max-lg:hidden'
					/>
				</div>
				<div data-reveal>
					<TripCompare />
					<LearnList
						entries={LEARNS}
						testId='landing-memory-learns-compact'
						className='mt-[22px] lg:hidden'
					/>
				</div>
			</div>
		</SectionWrapper>
	)
}
