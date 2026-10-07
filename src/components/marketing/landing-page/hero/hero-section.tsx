import type { CSSProperties } from 'react'

import { Avatars, ButtonLink, Check, Icon, Pill, ProgressBar, Shell } from '../commons'

import { cn } from '@/utils'

type Slip = {
	shop: string
	lines: [string, string][]
	total: string
	style: CSSProperties
}

// Receipt fragments stay around the outside of the hero so the product mockups remain clear.
const RECEIPT_PILE: Slip[] = [
	{
		shop: 'CORNER DELI',
		lines: [
			['RYE LOAF', '3.40'],
			['GREEN OLIVES', '2.95'],
		],
		total: '6.35',
		style: {
			left: '-3%',
			top: '18%',
			width: 142,
			fontSize: 8,
			transform: 'rotate(-8deg)',
		},
	},
	{
		shop: 'FARMERS MARKET',
		lines: [
			['APPLES 2KG', '3.80'],
			['POTATOES 2KG', '2.40'],
			['KALE', '1.90'],
			['BEETROOT', '1.60'],
			['SQUASH', '2.70'],
			['RED ONIONS', '1.80'],
			['CUCUMBERS', '1.50'],
			['PEARS', '2.80'],
			['STRAWBERRIES', '4.20'],
			['CARROTS 1KG', '1.40'],
		],
		total: '24.10',
		style: {
			left: '9%',
			top: '31%',
			width: 132,
			fontSize: 7.5,
			transform: 'rotate(5deg)',
		},
	},
	{
		shop: 'PAPER & INK',
		lines: [
			['NOTEBOOK', '4.50'],
			['PENS (5)', '3.20'],
		],
		total: '7.70',
		style: {
			left: '3%',
			top: '44%',
			width: 126,
			fontSize: 7.5,
			transform: 'rotate(5deg)',
		},
	},
	{
		shop: 'PHARMACY WEST',
		lines: [
			['TOOTHPASTE', '3.60'],
			['VITAMIN D 60CT', '7.40'],
			['HAND SOAP', '2.85'],
			['COTTON PADS', '2.10'],
			['SUNSCREEN SPF 50', '9.60'],
			['BANDAGES', '2.40'],
			['SHAMPOO 400ML', '4.80'],
			['MOISTURIZER', '6.90'],
			['MOUTHWASH', '5.20'],
		],
		total: '44.85',
		style: {
			left: '-1%',
			top: '70%',
			width: 146,
			fontSize: 8,
			transform: 'rotate(-4deg)',
		},
	},
	{
		shop: 'ORCHARD LANE',
		lines: [
			['PEARS 1KG', '2.90'],
			['FIGS', '4.10'],
		],
		total: '7.00',
		style: {
			left: '3%',
			top: '59%',
			width: 124,
			fontSize: 7.5,
			transform: 'rotate(6deg)',
		},
	},
	{
		shop: 'GREENGROCER 24',
		lines: [
			['TOMATOES 1KG', '2.10'],
			['FRESH BASIL', '1.20'],
			['LEMONS (4)', '1.80'],
			['RED ONIONS', '1.95'],
		],
		total: '7.05',
		style: {
			left: '9%',
			top: '84%',
			width: 138,
			fontSize: 7.5,
			transform: 'rotate(4deg)',
		},
	},
	{
		shop: 'MILL BAKERY',
		lines: [
			['SEEDED BOULE', '5.60'],
			['CORNBREAD', '3.30'],
			['CROISSANTS (4)', '6.00'],
			['OAT COOKIES', '3.50'],
			['BAGUETTE', '2.40'],
			['WALNUT LOAF', '4.75'],
			['BRIOCHE', '4.10'],
			['MUFFINS (2)', '2.80'],
			['APPLE TURNOVER', '3.40'],
		],
		total: '35.85',
		style: {
			right: '-3%',
			top: '15%',
			width: 138,
			fontSize: 8,
			transform: 'rotate(6deg)',
		},
	},
	{
		shop: 'SUNSET LIQUOR',
		lines: [
			['ALBARINO', '12.40'],
			['TONIC 6PK', '4.60'],
		],
		total: '17.00',
		style: {
			right: '3%',
			top: '37%',
			width: 126,
			fontSize: 7.5,
			transform: 'rotate(-5deg)',
		},
	},
	{
		shop: 'TOWN HARDWARE',
		lines: [
			['LIGHT BULBS 4PK', '5.20'],
			['BATTERIES AA', '4.10'],
			['PACKING TAPE', '1.90'],
			['SCREWS 50CT', '3.40'],
			['HAMMER', '8.90'],
			['NAILS 50CT', '2.30'],
			['TAPE MEASURE', '6.50'],
			['SCREWDRIVER', '4.80'],
		],
		total: '37.10',
		style: {
			right: '14%',
			top: '55%',
			width: 132,
			fontSize: 7.5,
			transform: 'rotate(-5deg)',
		},
	},
	{
		shop: 'VALLEY DAIRY',
		lines: [
			['WHOLE MILK 2L', '2.20'],
			['BUTTER 250G', '3.10'],
		],
		total: '5.30',
		style: {
			right: '-1%',
			top: '62%',
			width: 142,
			fontSize: 8,
			transform: 'rotate(4deg)',
		},
	},
	{
		shop: 'THE SPICE JAR',
		lines: [
			['SMOKED PAPRIKA', '2.90'],
			['CUMIN SEED', '2.10'],
			['BAY LEAVES', '1.40'],
			['SAFFRON', '8.90'],
		],
		total: '15.30',
		style: {
			right: '8%',
			top: '82%',
			width: 142,
			fontSize: 7.5,
			transform: 'rotate(-6deg)',
		},
	},
]

const RECEIPT_LINES: [string, string][] = [
	['ORGANIC STRAWBERRIES', '5.99'],
	['ALMOND MILK 1L', '4.50'],
	['SOURDOUGH BREAD', '5.25'],
	['AVOCADOS (3)', '4.99'],
	['GREEK YOGURT 500G', '6.50'],
	['CHERRY TOMATOES 1KG', '3.75'],
	['BABY SPINACH 200G', '2.40'],
	['FREE-RANGE EGGS (12)', '4.80'],
	['PARMESAN 250G', '6.20'],
	['CHICKEN BREAST 1KG', '12.30'],
	['OLIVE OIL 750ML', '9.10'],
	['SPARKLING WATER 6PK', '4.80'],
]

const PHONE_CATEGORIES = [
	{
		name: '🥖 Bakery',
		items: [{ name: 'Sourdough bread', qty: '1 unit', done: false }],
	},
	{
		name: '🥛 Dairy',
		items: [
			{ name: 'Almond milk', qty: '1 unit', done: false },
			{ name: 'Greek yogurt', qty: '1 unit', done: true },
		],
	},
	{
		name: '🍎 Produce',
		items: [
			{ name: 'Organic strawberries', qty: '1 box', done: false },
			{ name: 'Avocados', qty: '3 unit', done: false },
		],
	},
]

export function HeroSection() {
	return (
		<section
			data-testid='landing-hero'
			className='relative flex min-h-[calc(100vh-64px)] min-h-[calc(100svh-64px)] items-start overflow-hidden bg-transparent py-11 before:pointer-events-none before:absolute before:-inset-x-[12%] before:-inset-y-[14%] before:z-0 before:content-[""] min-[1100px]:py-14 hero-glow grid place-content-center'
		>
			<div
				className='pointer-events-none absolute inset-0 z-[1] hidden opacity-35 min-[1400px]:block'
				aria-hidden='true'
			>
				{RECEIPT_PILE.map(slip => (
					<div
						key={slip.shop}
						className='absolute w-[172px] rounded-t-[10px] bg-white px-3 pt-[11px] pb-4 font-mono text-[8px] leading-[1.7] text-slate-400 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.55)]'
						style={slip.style}
					>
						<b className='mb-[2px] block text-[9.5px] font-semibold text-slate-500'>{slip.shop}</b>
						<div className='my-[5px] h-px bg-slate-200' />
						{slip.lines.map(([item, price]) => (
							<div
								key={item}
								className='flex justify-between gap-2'
							>
								<span className='min-w-0 truncate'>{item}</span>
								<span>{price}</span>
							</div>
						))}
						<div className='my-[5px] h-px bg-slate-200' />
						<div className='flex justify-between gap-2'>
							<span>TOTAL</span>
							<span>{slip.total}</span>
						</div>
					</div>
				))}
			</div>

			<Shell className='relative z-[2] w-full'>
				<div className='flex flex-col items-center gap-12 min-[760px]:gap-14'>
					<div className='mx-auto flex w-full max-w-[850px] flex-col items-center text-center'>
						<div className='inline-flex w-fit items-center gap-[7px] rounded-full border border-primary/[0.22] bg-primary/[0.09] px-[11px] py-[5px] text-xs font-bold text-blue-700'>
							<Icon
								id='spark'
								className='size-[13px] shrink-0 text-amber-500'
							/>
							Receipt to smart list in seconds
						</div>
						<h1 className='mt-5 max-w-[19ch] text-[clamp(36px,6vw,58px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-slate-900 text-balance'>
							Never write the same shopping list twice.
						</h1>
						<p className='mt-5 max-w-[39em] text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-slate-600'>
							Photograph a receipt you already have. Listys turns it into a list your household can reuse, share, and
							check off in the aisle.
						</p>
						<div className='mt-7 flex flex-wrap items-center justify-center gap-3'>
							<ButtonLink
								size='xl'
								href='/auth/signup'
							>
								Create free account <Icon id='arr' />
							</ButtonLink>
						</div>
						<ul className='mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2'>
							{['Free to get started', 'No credit card required', 'Works for any store'].map(point => (
								<li
									key={point}
									className='flex items-center gap-2 text-[13.5px] text-slate-500'
								>
									<Icon
										id='tick'
										className='size-[13px] shrink-0 text-primary'
									/>
									{point}
								</li>
							))}
						</ul>
					</div>

					<div className='relative mx-auto flex min-h-[610px] w-[min(680px,100vw)] items-start justify-center'>
						<div className='absolute top-5 left-1/2 w-[min(270px,68vw)] -translate-x-[76%] opacity-95 min-[630px]:top-7 min-[630px]:left-[calc(50%_-_307px)] min-[630px]:w-[270px] min-[630px]:translate-x-0'>
							<div className='drop-shadow-[0_20px_30px_rgba(15,23,42,0.16)] min-[1100px]:-rotate-3'>
								<div className='receipt-torn relative rounded-t-[10px] bg-white px-[18px] pt-5 pb-[24px] font-mono text-[11.5px] leading-[1.7] text-slate-700'>
									<span
										className='scan-line z-10 opacity-70 motion-reduce:animate-none'
										aria-hidden='true'
									/>
									<div className='mb-3 text-center'>
										<div className='text-[15px] font-semibold tracking-[.06em] text-slate-900'>MARKET FRESH</div>
										<div className='mt-[3px] text-[10px] tracking-[.02em] text-slate-500'>123 Green Avenue, CA</div>
										<div className='mt-[3px] text-[10px] tracking-[.02em] text-slate-500'>05/24/2024 · 14:22</div>
									</div>
									<div className='my-[10px] border-t border-dashed border-slate-300' />
									<div className='flex justify-between text-[9.5px] tracking-[.14em] text-slate-500 uppercase'>
										<span>Item</span>
										<span>Price</span>
									</div>
									<div className='my-[10px] border-t border-dashed border-slate-300' />
									<div className='flex flex-col gap-[5px]'>
										{RECEIPT_LINES.map(([item, price]) => (
											<div
												key={item}
												className='flex justify-between gap-3 tabular-nums'
											>
												<span className='min-w-0 truncate'>{item}</span>
												<span>{price}</span>
											</div>
										))}
									</div>
									<div className='my-[10px] border-t border-dashed border-slate-300' />
									<div className='flex justify-between text-[15px] font-semibold tracking-[.04em] text-slate-900 tabular-nums'>
										<span>TOTAL</span>
										<span>70.58</span>
									</div>
									<div className='mt-[14px] text-center text-[10px] tracking-[.18em] text-slate-500'>THANK YOU!</div>
									<div
										className='receipt-barcode mx-auto mt-[10px] h-[30px] w-[76%]'
										aria-hidden='true'
									/>
								</div>
							</div>
							<p className='mt-4 flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[9.5px] leading-none tracking-[.02em] text-sky-700 min-[1100px]:-rotate-3'>
								<i className='block size-[6px] shrink-0 rounded-full bg-sky-400' />
								Market Fresh · 12 items · 5 categories
							</p>
						</div>
						<div className='relative z-10 min-[630px]:translate-x-[147px]'>
							<p className='sr-only'>
								A phone showing the twelve items from that receipt as a shopping list in progress, three of twelve
								collected, shared with two other people.
							</p>
							<div
								className='before:content-[""] relative z-10 mx-auto aspect-[1/2.05] w-[320px] max-w-[calc(100vw-32px)] rounded-[38px] bg-slate-800 p-[6px] shadow-[0_44px_88px_-34px_rgba(30,58,138,0.5)] before:absolute before:top-[15px] before:left-1/2 before:z-[3] before:h-[25px] before:w-[86px] before:-translate-x-1/2 before:rounded-full before:bg-[#0B1120] min-[1100px]:rotate-[1deg]'
								aria-hidden='true'
							>
								<div className='relative flex h-full flex-col overflow-hidden rounded-[34px] bg-white'>
									<div className='flex items-center justify-between px-5 pt-[13px] pb-2 text-xs font-bold tracking-[-0.01em] text-slate-900'>
										<span>9:41</span>
										<span className='flex items-center gap-[5px] text-slate-900'>
											<Icon
												id='ic-signal'
												className='h-[11px] w-4'
											/>
											<Icon
												id='ic-wifi'
												className='h-[11px] w-[15px]'
											/>
											<Icon
												id='ic-batt'
												className='h-[11px] w-6'
											/>
										</span>
									</div>
									<div className='h-[116px] bg-[url(/images/landing/session-cover.jpg)] bg-cover bg-center' />
									<div className='flex flex-col gap-[10px] border-b border-slate-200 px-[15px] pt-[14px] pb-[15px]'>
										<div className='flex items-center justify-between gap-[10px]'>
											<span className='text-[19px] leading-[1.15] font-extrabold tracking-[-0.03em] text-slate-900'>
												Market Fresh
											</span>
											<Pill kind='live'>Shopping</Pill>
										</div>
										<div className='mt-[3px] text-xs text-slate-500'>May 24, 2024 · 12 items</div>
										<div>
											<div className='flex items-center justify-between gap-[10px]'>
												<span className='text-[13px] font-semibold text-slate-700'>Progress</span>
												<span className='text-2xl leading-[0.9] font-extrabold tracking-[-0.035em] text-primary tabular-nums'>
													25%
												</span>
											</div>
											<ProgressBar
												value={25}
												className='mt-[7px]'
											/>
											<div className='mt-[6px] text-[11.5px] text-slate-500'>3 of 12 items checked</div>
										</div>
										<div className='flex items-center gap-[10px]'>
											<Avatars initials={['NH', 'EC', 'AV']} />
											<span className='flex-1 text-[12.5px] font-semibold text-slate-700'>Shared with family</span>
											<Icon
												id='chev'
												className='size-[13px] shrink-0 -rotate-90 text-slate-400'
											/>
										</div>
									</div>
									<div className='relative flex-1 overflow-hidden'>
										<div className='flex flex-col gap-[10px] px-[11px] pt-[10px] pb-[14px]'>
											{PHONE_CATEGORIES.map(category => {
												const checkedCount = category.items.filter(item => item.done).length

												return (
													<div
														className='flex flex-col gap-[7px]'
														key={category.name}
													>
														<div className='flex flex-col gap-px px-[2px]'>
															<b className='text-xs font-extrabold tracking-[.01em] text-slate-900 uppercase'>
																{category.name}
															</b>
															<span className='text-[9px] font-bold leading-[1.3] text-slate-500'>
																{category.items.length} {category.items.length === 1 ? 'ITEM' : 'ITEMS'} {checkedCount}/
																{category.items.length} CHECKED
															</span>
														</div>
														<div className='flex flex-col gap-[7px]'>
															{category.items.map(row => (
																<div
																	key={row.name}
																	className={cn(
																		'flex items-center gap-[9px] rounded-[10px] border border-slate-200 bg-white px-[9px] py-[7px]',
																		row.done && 'border-primary bg-[#F7FAFF]',
																	)}
																>
																	<span className='inline-flex h-[29px] min-w-[46px] shrink-0 items-center justify-center rounded-md bg-blue-100 px-[6px] font-mono text-[9px] font-semibold text-blue-700'>
																		{row.qty}
																	</span>
																	<span className='min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900'>
																		{row.name}
																	</span>
																	<Check
																		on={row.done}
																		className='size-[18px] rounded-[5px]'
																	/>
																</div>
															))}
														</div>
													</div>
												)
											})}
										</div>
										<div className='absolute inset-x-0 bottom-0 h-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0),#fff_72%)]' />
									</div>
									<div className='flex border-t border-slate-200 bg-white px-[6px] pt-[9px] pb-[11px]'>
										<span className='flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold text-primary'>
											<Icon
												id='i-list'
												className='size-[19px]'
											/>
											List
										</span>
										<span className='flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold text-slate-400'>
											<Icon
												id='ic-scan'
												className='size-[19px]'
											/>
											Scan
										</span>
										<span className='flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold text-slate-400'>
											<Icon
												id='i-folders'
												className='size-[19px]'
											/>
											Lists
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Shell>
		</section>
	)
}
