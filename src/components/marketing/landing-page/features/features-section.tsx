import type { ReactNode } from 'react'

import { Avatars, Pill, ProgressBar, Row, Rows } from '../commons'

type Feature = {
	title: string
	body: string
	fragTitle: string
	fragMeta: string
	fragAside?: ReactNode
	content: ReactNode
}

const FEATURES: Feature[] = [
	{
		title: 'Receipts in, items out',
		body: 'Upload up to five photos at once. Every line stays editable.',
		fragTitle: 'Receipts',
		fragMeta: '3 uploaded today',
		content: (
			<Rows>
				<Row
					chip='05/24'
					name='Market Fresh'
					meta='12 items extracted'
					dated
					aside={<Pill kind='live'>Done</Pill>}
				/>
				<Row
					chip='05/17'
					name='Greengrocer 24'
					meta='6 items extracted'
					dated
					aside={<Pill kind='live'>Done</Pill>}
				/>
				<Row
					chip='05/11'
					name='Corner Deli'
					meta='reading page 2 of 3'
					dated
					aside={<Pill kind='scan'>Reading</Pill>}
				/>
			</Rows>
		),
	},
	{
		title: 'A list that remembers',
		body: 'How often you buy each item, and what it usually cost.',
		fragTitle: 'Weekly household',
		fragMeta: '12 items · 5 categories',
		content: (
			<Rows>
				<Row
					chip='1 box'
					name='organic strawberries'
					meta='bought 6× · last Jun 21 · $5.99 avg'
				/>
				<Row
					chip='1 L'
					name='almond milk'
					meta='bought 4× · last Jun 21 · $4.50 avg'
				/>
			</Rows>
		),
	},
	{
		title: 'Group your lists',
		body: 'One group per place, each with its own lists.',
		fragTitle: 'Your groups',
		fragMeta: '3 groups',
		content: (
			<Rows>
				<Row
					chip='3'
					name='Weekly shop'
					meta='Weekly household · Bulk run · Snacks'
				/>
				<Row
					chip='1'
					name='Pharmacy'
					meta='Monthly refill'
				/>
				<Row
					chip='2'
					name='Beach house'
					meta='Arrival day · Barbecue'
				/>
			</Rows>
		),
	},
	{
		title: 'Shop without breaking it',
		body: 'The trip is a clone. Your base list never changes.',
		fragTitle: 'Weekly household',
		fragMeta: 'Progress: 7 of 12 items',
		fragAside: <Pill kind='live'>Shopping</Pill>,
		content: (
			<>
				<ProgressBar
					value={58}
					className='mb-[11px]'
				/>
				<Rows>
					<Row
						chip='1 box'
						name='organic strawberries'
						checked
						done
					/>
					<Row
						chip='1 kg'
						name='cherry tomatoes'
						checked={false}
					/>
				</Rows>
			</>
		),
	},
	{
		title: 'One live list at home',
		body: 'A check lands for everyone the moment it happens.',
		fragTitle: 'Weekly household',
		fragMeta: '4 of 9 items checked',
		fragAside: <Avatars initials={['MY', 'NH', 'AV']} />,
		content: (
			<Rows>
				<Row
					chip='1 L'
					name='almond milk'
					by='Picked up by Noah'
					checked
					done
				/>
				<Row
					chip='4 unit'
					name='lemons'
					by='Added by Ava'
					checked={false}
				/>
			</Rows>
		),
	},
	{
		title: 'Every trip is kept',
		body: 'Turn any past shop back into a list.',
		fragTitle: 'Shopping history',
		fragMeta: '18 trips',
		content: (
			<Rows>
				<Row
					chip='Jun 21'
					name='Weekly household'
					meta='12 of 12 items · $70.58'
					checked
					done
					dated
				/>
				<Row
					chip='Jun 07'
					name='Weekly household'
					meta='9 of 9 items · $52.10'
					checked
					done
					dated
				/>
				<Row
					chip='May 24'
					name='Pharmacy run'
					meta='4 of 4 items · $17.05'
					checked
					done
					dated
				/>
			</Rows>
		),
	},
]

export function FeaturesSection() {
	return (
		<div
			data-testid='landing-features'
			className='w-full'
		>
			<div className='mb-[34px] grid gap-4 min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-[60px]'>
				<h2 className='text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-extrabold text-slate-900 text-balance'>
					The whole app, at a glance
				</h2>
				<p className='max-w-[34em] text-base leading-[1.6] text-slate-600 min-[900px]:pt-[7px]'>
					Receipts, lists, groups, trips, people and history — all of it in the free account. There is only one.
				</p>
			</div>
			<div className='grid grid-cols-1 gap-5 min-[680px]:grid-cols-2 min-[1040px]:grid-cols-3'>
				{FEATURES.map(feature => (
					<div
						key={feature.title}
						className='flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white'
					>
						<div
							className='relative h-[224px] overflow-hidden bg-[#F4F8FF] after:absolute after:inset-x-0 after:bottom-0 after:h-[78px] after:bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.55)_58%,#fff_100%)] after:content-[""]'
							aria-hidden='true'
						>
							<div className='absolute top-6 right-5 left-[22px] rounded-xl border border-slate-200 bg-white px-[14px] py-[13px] shadow'>
								<div className='mb-[11px] flex items-start justify-between gap-[10px]'>
									<div>
										<div className='text-[12.5px] font-extrabold tracking-[-0.02em] text-slate-900'>
											{feature.fragTitle}
										</div>
										<div className='mt-1 font-mono text-[11px] text-slate-500'>{feature.fragMeta}</div>
									</div>
									{feature.fragAside}
								</div>
								{feature.content}
							</div>
						</div>
						<div className='px-[22px] pt-5 pb-6'>
							<h3 className='text-[17px] leading-[1.3] font-bold tracking-[-0.022em] text-slate-900'>
								{feature.title}
							</h3>
							<p className='mt-2 text-sm leading-[1.55] text-slate-500'>{feature.body}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
