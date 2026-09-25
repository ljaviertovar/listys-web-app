import type { CSSProperties } from 'react'

import { ButtonLink } from './button-link'
import { Icon } from './landing-icons'
import { Shell } from './shell'
import { Avatars, Check, Pill, ProgressBar } from './list-rows'

import { cn } from '@/utils'

type Slip = {
	shop: string
	lines: [string, string][]
	total: string
	style: CSSProperties
}

// The drawer of old receipts behind the hero (desktop only, decorative).
const RECEIPT_PILE: Slip[] = [
	{ shop: 'CORNER DELI', lines: [['RYE LOAF', '3.40'], ['GREEN OLIVES', '2.95'], ['COFFEE BEANS', '8.20'], ['SMOKED HAM', '5.10']], total: '19.65', style: { left: '-4%', top: '66%', width: 170, fontSize: 8, transform: 'rotate(-9deg)' } },
	{ shop: 'GREENGROCER 24', lines: [['TOMATOES 1KG', '2.10'], ['FRESH BASIL', '1.20'], ['LEMONS (4)', '1.80'], ['RED ONIONS', '1.95'], ['CARROTS 1KG', '1.40'], ['BANANAS', '2.15'], ['SPINACH 200G', '1.75']], total: '12.35', style: { left: '4%', top: '76%', width: 140, fontSize: 7.5, transform: 'rotate(6deg)' } },
	{ shop: 'PHARMACY WEST', lines: [['TOOTHPASTE', '3.60'], ['VITAMIN D 60CT', '7.40'], ['HAND SOAP', '2.85']], total: '13.85', style: { left: '12%', top: '62%', width: 158, fontSize: 8.5, transform: 'rotate(-4deg)' } },
	{ shop: 'BAKERY ON 5TH', lines: [['SOURDOUGH', '5.25'], ['CROISSANTS (4)', '6.00'], ['WALNUT LOAF', '4.75'], ['OAT COOKIES', '3.50'], ['BAGUETTE', '2.40'], ['BRIOCHE', '4.10']], total: '26.00', style: { left: '19%', top: '82%', width: 126, fontSize: 7.5, transform: 'rotate(11deg)' } },
	{ shop: 'HOUSEHOLD CO.', lines: [['DISH SOAP 1L', '2.60'], ['LAUNDRY POWDER', '11.40'], ['BIN LINERS', '3.75']], total: '17.75', style: { left: '26%', top: '70%', width: 182, fontSize: 8, transform: 'rotate(-7deg)' } },
	{ shop: 'FARMERS MARKET', lines: [['APPLES 2KG', '3.80'], ['POTATOES 2KG', '2.40'], ['KALE', '1.90'], ['BEETROOT', '1.60'], ['SQUASH', '2.70']], total: '12.40', style: { left: '33%', top: '86%', width: 134, fontSize: 7.5, transform: 'rotate(3deg)' } },
	{ shop: 'BUTCHER & CO', lines: [['BEEF MINCE', '6.40'], ['PORK CHOPS', '8.20']], total: '14.60', style: { left: '40%', top: '64%', width: 150, fontSize: 8.5, transform: 'rotate(-12deg)' } },
	{ shop: 'CHEESE ROOM', lines: [['MANCHEGO 200G', '7.30'], ['BRIE', '4.60'], ['CRACKERS', '2.80'], ['OLIVES', '3.10'], ['GOAT LOG', '5.40']], total: '23.20', style: { left: '47%', top: '78%', width: 166, fontSize: 8, transform: 'rotate(8deg)' } },
	{ shop: 'ORCHARD LANE', lines: [['PEARS 1KG', '2.90'], ['PLUMS 500G', '2.20'], ['GRAPES 1KG', '3.60'], ['FIGS', '4.10']], total: '12.80', style: { left: '54%', top: '88%', width: 122, fontSize: 7.5, transform: 'rotate(-5deg)' } },
	{ shop: 'WINE CELLAR', lines: [['RIOJA 2018', '11.50'], ['SPARKLING', '9.90']], total: '21.40', style: { left: '60%', top: '68%', width: 176, fontSize: 8.5, transform: 'rotate(5deg)' } },
	{ shop: 'PET SUPPLY', lines: [['DRY FOOD 3KG', '14.20'], ['CAT LITTER', '6.80'], ['TREATS', '3.40'], ['CHEW TOY', '4.90']], total: '29.30', style: { left: '67%', top: '80%', width: 138, fontSize: 7.5, transform: 'rotate(-10deg)' } },
	{ shop: 'DAILY GREENS', lines: [['ROCKET 150G', '1.80'], ['CHERRY TOM.', '2.60'], ['CUCUMBER', '0.85'], ['AVOCADO (2)', '3.40']], total: '8.65', style: { left: '74%', top: '90%', width: 154, fontSize: 8, transform: 'rotate(7deg)' } },
	{ shop: 'HARBOUR FISH', lines: [['SALMON FILLET', '9.80'], ['PRAWNS 250G', '6.40'], ['MUSSELS 1KG', '5.20']], total: '21.40', style: { left: '81%', top: '72%', width: 130, fontSize: 7.5, transform: 'rotate(-3deg)' } },
	{ shop: 'THE SPICE JAR', lines: [['SMOKED PAPRIKA', '2.90'], ['CUMIN SEED', '2.10'], ['BAY LEAVES', '1.40'], ['PEPPERCORNS', '3.60'], ['SAFFRON', '8.90']], total: '18.90', style: { left: '88%', top: '84%', width: 162, fontSize: 8.5, transform: 'rotate(9deg)' } },
	{ shop: 'MILL BAKERY', lines: [['SEEDED BOULE', '5.60'], ['CORNBREAD', '3.30']], total: '8.90', style: { left: '94%', top: '66%', width: 144, fontSize: 8, transform: 'rotate(-8deg)' } },
	{ shop: 'TOWN HARDWARE', lines: [['LIGHT BULBS 4PK', '5.20'], ['BATTERIES AA', '4.10'], ['PACKING TAPE', '1.90'], ['SCREWS 50CT', '3.40']], total: '14.60', style: { left: '-6%', top: '40%', width: 132, fontSize: 7.5, transform: 'rotate(12deg)' } },
	{ shop: 'PAPER & INK', lines: [['NOTEBOOK', '4.50'], ['PENS (5)', '3.20'], ['ENVELOPES', '2.10']], total: '9.80', style: { left: '-3%', top: '53%', width: 120, fontSize: 8, transform: 'rotate(-6deg)' } },
	{ shop: 'CORNER PHARMACY', lines: [['IBUPROFEN', '3.10'], ['PLASTERS', '2.40'], ['SUNSCREEN 50', '9.60']], total: '15.10', style: { right: '-5%', top: '34%', width: 140, fontSize: 8, transform: 'rotate(-9deg)' } },
	{ shop: 'VALLEY DAIRY', lines: [['WHOLE MILK 2L', '2.20'], ['BUTTER 250G', '3.10'], ['YOGHURT 4PK', '3.80'], ['CHEDDAR 300G', '5.40']], total: '14.50', style: { right: '-2%', top: '49%', width: 128, fontSize: 7.5, transform: 'rotate(7deg)' } },
	{ shop: 'SUNSET LIQUOR', lines: [['ALBARINO', '12.40'], ['VERMOUTH', '9.20'], ['TONIC 6PK', '4.60']], total: '26.20', style: { right: '1%', top: '20%', width: 116, fontSize: 7.5, transform: 'rotate(-4deg)' } },
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
	{ name: '🥖 Bakery', items: [{ name: 'Sourdough bread', qty: '1 unit', done: false }] },
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

export function Hero() {
	return (
		<section
			data-testid='landing-hero'
			className='relative flex min-h-[calc(100vh-64px)] min-h-[calc(100svh-64px)] items-center overflow-hidden bg-gradient-to-b from-[#F4F8FF] to-slate-50 to-[78%] py-11 before:pointer-events-none before:absolute before:-inset-x-[12%] before:-inset-y-[14%] before:z-0 before:content-[""] min-[1100px]:py-14 hero-glow'
		>
			<div
				className='pointer-events-none absolute inset-0 z-[1] hidden opacity-50 min-[1100px]:block'
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
				<div className='grid gap-10 min-[760px]:grid-cols-2 min-[760px]:items-start min-[1100px]:grid-cols-[minmax(0,1.05fr)_250px_300px] min-[1100px]:gap-8'>
					<div className='min-[760px]:max-[1099px]:col-span-full'>
						<div className='inline-flex w-fit items-center gap-[7px] rounded-full border border-primary/[0.22] bg-primary/[0.09] px-[11px] py-[5px] text-xs font-bold text-blue-700'>
							<Icon
								id='spark'
								className='size-[13px] shrink-0 text-amber-500'
							/>
							Receipt to smart list in seconds
						</div>
						<h1 className='mt-5 text-[clamp(34px,6vw,50px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-slate-900 text-balance'>
							Never write the same shopping list twice.
						</h1>
						<p className='mt-5 max-w-[30em] text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-slate-600'>
							Photograph a receipt you already have. Listys turns it into a list your household can reuse,
							share, and check off in the aisle.
						</p>
						<div className='mt-[30px] flex flex-wrap items-center gap-4'>
							<ButtonLink
								size='xl'
								href='/auth/signup'
							>
								Create free account <Icon id='arr' />
							</ButtonLink>
							<ButtonLink
								size='xl'
								variant='ghost'
								href='/#how-it-works'
							>
								See how it works
							</ButtonLink>
						</div>
						<ul className='mt-6 flex flex-wrap gap-x-[22px] gap-y-[9px]'>
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

					<div>
						<div className='drop-shadow-[0_20px_30px_rgba(15,23,42,0.16)]'>
							<div className='receipt-torn relative rounded-t-[10px] bg-white px-[18px] pt-5 pb-[34px] font-mono text-[11.5px] leading-[1.7] text-slate-700'>
								<span
									className='motion-reduce:animate-none absolute top-[42%] right-0 left-0 h-[2px] animate-[seam_2.4s_cubic-bezier(0.4,0,0.2,1)_0.4s_1_both] bg-[linear-gradient(90deg,transparent,#38BDF8_22%,#38BDF8_78%,transparent)]'
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
						<p className='mt-[14px] flex items-center gap-2 font-mono text-[11.5px] tracking-[.04em] text-sky-700'>
							<i className='block size-[6px] shrink-0 rounded-full bg-sky-400' />
							Market Fresh · 12 items · 5 categories
						</p>
					</div>

					<div>
						<p className='sr-only'>
							A phone showing the twelve items from that receipt as a shopping list in progress, three of twelve
							collected, shared with two other people.
						</p>
						<div
							className='before:content-[""] relative mx-auto max-w-[300px] rounded-[38px] bg-slate-800 p-[6px] shadow-[0_44px_88px_-34px_rgba(30,58,138,0.5)] before:absolute before:top-[15px] before:left-1/2 before:z-[3] before:h-[25px] before:w-[86px] before:-translate-x-1/2 before:rounded-full before:bg-[#0B1120]'
							aria-hidden='true'
						>
							<div className='relative flex h-[628px] flex-col overflow-hidden rounded-[34px] bg-white'>
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
															{category.items.length} {category.items.length === 1 ? 'ITEM' : 'ITEMS'}{' '}
															{checkedCount}/{category.items.length} CHECKED
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
			</Shell>
		</section>
	)
}
