'use client'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion } from 'framer-motion'
import {
	ArrowRight01Icon,
	AnalyticsUpIcon,
	Camera01Icon,
	CheckmarkCircle02Icon,
	Share02Icon,
	SparklesIcon,
	ShoppingCart02Icon,
	ViewIcon,
	Checkmark,
} from '@hugeicons/core-free-icons'
import {
	FADE_UP,
	FEATURE_ACCENTS,
	FEATURE_CARDS,
	HERO_MEDIA_REVEAL,
	PROCESS_STEPS,
	REVEAL_VIEWPORT,
	STAGGER_REVEAL,
	STAT_ACCENTS,
	TRUST_STATS,
} from '@/data/constants'
import { Footer } from '@/components/marketing/footer'
import { Faq } from '@/components/marketing/faq'
import { SharedListsShowcase } from '@/components/marketing/shared-lists-showcase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function LandingPageContent() {
	const mobileHeroBadges = [
		{ label: 'AI extraction', icon: Camera01Icon },
		{ label: 'Auto-categorized', icon: SparklesIcon },
		{ label: 'Shared lists', icon: Share02Icon },
		{ label: 'Live sync', icon: ShoppingCart02Icon },
		{ label: 'Spend tracking', icon: AnalyticsUpIcon },
		{ label: '99% OCR accuracy', icon: ViewIcon },
	]
	const phonePreviewProgress = { checked: 1, total: 28, percent: 4 }
	const phonePreviewSections = [
		{
			icon: '🥖',
			title: 'BAKERY',
			meta: '1 Item   0/1 Checked',
			items: [{ name: 'sourdough bread', notes: '', quantity: 1, unit: 'unit', checked: false }],
		},
		{
			icon: '🥛',
			title: 'DAIRY',
			meta: '2 Items   1/2 Checked',
			items: [
				{ name: 'Almond milk', notes: '', quantity: 1, unit: 'unit', checked: false },
				{ name: 'Greek yogurt', notes: '', quantity: 1, unit: 'unit', checked: true },
			],
		},
		{
			icon: '🍎',
			title: 'PRODUCE',
			meta: '2 Items   0/2 Checked',
			items: [
				{ name: 'Organic strawberries', notes: '', quantity: 1, unit: 'box', checked: false },
				{ name: 'Avocados', notes: '(3)', quantity: 3, unit: 'unit', checked: false },
			],
		},
	]

	return (
		<div className='relative w-full overflow-hidden bg-slate-50 text-slate-900'>
			{/* =============================================
			    HERO SECTION
			    ============================================= */}
			<section className='hero-mesh relative overflow-hidden pb-20 pt-12 sm:pb-24 sm:pt-28 md:pt-32'>
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent' />
				<motion.div
					className='relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8'
					initial='hidden'
					animate='show'
					variants={STAGGER_REVEAL}
				>
					<motion.div
						className='mx-auto mb-12 max-w-3xl'
						variants={STAGGER_REVEAL}
					>
						<motion.div
							className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary'
							variants={FADE_UP}
						>
							<HugeiconsIcon
								icon={SparklesIcon}
								className='h-4 w-4 text-amber-400'
							/>
							<span>Receipt to list in seconds</span>
						</motion.div>
						<motion.h1
							className='text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl md:text-7xl'
							variants={FADE_UP}
						>
							Turn Receipts into <br />
							<span className='bg-gradient-to-r from-primary via-blue-600 to-violet-700 bg-clip-text text-transparent'>
								Smart Shopping Lists
							</span>
						</motion.h1>
						<motion.p
							className='mx-auto mt-8 max-w-2xl text-balance text-lg font-medium leading-relaxed text-slate-600 md:text-xl'
							variants={FADE_UP}
						>
							Scan a receipt to get an organized shopping list you can share, check off live, and use to track spending
							and habits over time.
						</motion.p>

						<motion.div
							className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'
							variants={FADE_UP}
						>
							<Button
								size='lg'
								className='group h-14 w-full max-w-70 rounded-xl border border-white/10 px-10 text-lg font-bold shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/20 transition-all hover:-translate-y-1 hover:opacity-95 before:hidden after:hidden sm:w-auto'
								asChild
							>
								<Link
									href='/auth/signup'
									className='flex items-center gap-2'
								>
									Get started for free
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className='h-5 w-5 transition-transform group-hover:translate-x-1'
									/>
								</Link>
							</Button>
						</motion.div>
					</motion.div>

					<motion.div
						className='relative mx-auto mt-20 flex max-w-6xl flex-col items-center justify-center gap-8 md:flex-row lg:gap-20'
						variants={HERO_MEDIA_REVEAL}
					>
						<div className='absolute -left-6 top-[24%] z-20 hidden items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(37,99,235,0.45)] backdrop-blur md:flex lg:-left-10'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className='h-3.5 w-3.5'
								/>
							</span>
							No more manual entry
						</div>
						<div className='absolute -right-6 top-[64%] z-20 hidden items-center gap-2 rounded-full border border-chart-2/25 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(14,116,144,0.35)] backdrop-blur md:flex lg:-right-8'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-chart-2'>
								<HugeiconsIcon
									icon={SparklesIcon}
									className='h-3.5 w-3.5'
								/>
							</span>
							Auto-categorized
						</div>
						<div className='absolute -left-2 top-[64%] z-20 hidden items-center gap-2 rounded-full border border-chart-3/25 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(34,197,94,0.28)] backdrop-blur lg:flex'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-chart-3/10 text-chart-3'>
								<HugeiconsIcon
									icon={ShoppingCart02Icon}
									className='h-3.5 w-3.5'
								/>
							</span>
							Live sync
						</div>
						<div className='absolute right-4 top-[18%] z-20 hidden items-center gap-2 rounded-full border border-chart-4/25 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(59,130,246,0.25)] backdrop-blur lg:flex'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-chart-4/10 text-chart-4'>
								<HugeiconsIcon
									icon={AnalyticsUpIcon}
									className='h-3.5 w-3.5'
								/>
							</span>
							99% OCR accuracy
						</div>
						<div className='absolute right-[19%] top-[81%] z-20 hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(15,23,42,0.18)] backdrop-blur xl:flex'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
								<HugeiconsIcon
									icon={Share02Icon}
									className='h-3.5 w-3.5'
								/>
							</span>
							Shared lists
						</div>

						<div className='relative z-10 w-full max-w-[300px] -rotate-2 transform transition duration-500 hover:rotate-0'>
							<div className='relative overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/50'>
								<div className='scan-line' />
								<div className='relative space-y-4 font-mono text-sm'>
									<div className='mb-6 flex items-start justify-between'>
										<div className='flex flex-col'>
											<span className='text-lg font-bold text-slate-800'>MARKET FRESH</span>
											<span className='text-[10px] text-slate-400'>123 Green Avenue, CA</span>
										</div>
										<div className='text-right text-[10px] text-slate-400'>
											05/24/2024
											<br />
											14:22:01
										</div>
									</div>
									<div className='flex justify-between border-b border-slate-100 pb-2 text-[10px] uppercase tracking-widest text-slate-400'>
										<span>Item Description</span>
										<span>Price</span>
									</div>
									<div className='space-y-2 text-slate-700'>
										<div className='flex justify-between'>
											<span>ORGANIC STRAWBERRIES</span>
											<span>$5.99</span>
										</div>
										<div className='flex justify-between'>
											<span>ALMOND MILK</span>
											<span>$4.50</span>
										</div>
										<div className='flex justify-between'>
											<span>SOURDOUGH BREAD</span>
											<span>$5.25</span>
										</div>
										<div className='flex justify-between'>
											<span>AVOCADOS (3)</span>
											<span>$4.99</span>
										</div>
										<div className='flex justify-between'>
											<span>GREEK YOGURT</span>
											<span>$6.50</span>
										</div>
									</div>
									<div className='my-4 border-t border-dashed border-slate-300 pt-4' />
									<div className='flex justify-between text-lg font-bold text-slate-900'>
										<span>TOTAL</span>
										<span>$27.23</span>
									</div>
									<div className='mt-8 flex flex-col items-center gap-2 opacity-50'>
										<div className='h-8 w-24 rounded-sm border-2 border-slate-500 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_2px,#334155_2px,#334155_4px)]' />
										<span className='text-[10px]'>THANK YOU FOR SHOPPING</span>
									</div>
								</div>
							</div>
						</div>

						<div className='text-primary/50 md:hidden'>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className='h-10 w-10 rotate-90 animate-pulse drop-shadow-sm'
							/>
						</div>

						<div className='hidden text-primary/40 md:block'>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className='h-14 w-14 animate-pulse drop-shadow-sm'
							/>
						</div>

						<div className='relative z-10 w-full max-w-[320px]'>
							<div className='relative rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 p-3 shadow-[0_50px_100px_-20px_rgba(66,71,200,0.5)] ring-1 ring-white/10'>
								<div className='absolute left-1/2 top-0 z-30 h-7 w-32 -translate-x-1/2 transform rounded-b-2xl bg-black' />
								<div className='relative flex h-[600px] flex-col overflow-hidden rounded-[2rem] bg-white'>
									<div className='flex h-12 items-center justify-between px-8 pb-1 pt-3'>
										<span className='ml-2 text-[12px] font-bold text-slate-900'>9:41</span>
										<div className='mr-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700'>
											<span>5G</span>
											<span>WiFi</span>
											<span>100%</span>
										</div>
									</div>

									<div className='sticky top-0 z-20 border-b border-slate-100 bg-white/92 px-4 py-3 backdrop-blur'>
										<div className='flex items-start justify-between gap-3'>
											<div>
												<h4 className='text-[13px] font-extrabold tracking-tight text-slate-900'>MARKET FRESH</h4>
												<p className='mt-1 text-[10px] font-medium text-slate-500'>
													Progress: {phonePreviewProgress.checked} of {phonePreviewProgress.total} items
												</p>
											</div>
											<div className='flex items-center gap-2'>
												<span className='text-lg font-extrabold leading-none text-primary'>
													{phonePreviewProgress.percent}%
												</span>
												<span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700'>
													<span className='h-2 w-2 rounded-full bg-emerald-500' />
													Shopping
												</span>
											</div>
										</div>
										<div className='mt-2 h-1.5 rounded-full bg-slate-100'>
											<div
												className='h-full rounded-full bg-primary'
												style={{ width: `${phonePreviewProgress.percent}%` }}
											/>
										</div>
									</div>

									<div className='flex-1 space-y-3 overflow-y-auto px-4 py-3 pb-28'>
										{phonePreviewSections.map(section => (
											<div key={section.title}>
												<div className='mb-2'>
													<p className='flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-tight text-slate-800'>
														<span aria-hidden='true'>{section.icon}</span>
														<span>{section.title}</span>
													</p>
													<p className='mt-0.5 text-[9px] font-semibold uppercase tracking-tight text-slate-400 text-left'>
														{section.meta}
													</p>
												</div>

												<div className='space-y-2'>
													{section.items.map(item => (
														<div
															key={`${section.title}-${item.name}`}
															className={`rounded-xl border px-3 py-2 shadow-[0_10px_20px_-24px_rgba(15,23,42,0.25)]  ${item.checked ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}
														>
															<div className='flex items-center gap-2.5'>
																<div className='inline-flex h-7 min-w-[46px] items-center justify-center rounded-md bg-primary/10 px-2 text-[10px] font-bold text-primary'>
																	{item.quantity}
																	<span className='ml-1 text-[9px] font-semibold lowercase opacity-70'>
																		{item.unit}
																	</span>
																</div>
																<div className='min-w-0 flex-1 text-left'>
																	<p className='truncate text-[11px] font-bold tracking-tight text-slate-800'>
																		{item.name}
																	</p>
																	{item.notes ? (
																		<p className='truncate text-[10px] text-slate-500'>{item.notes}</p>
																	) : null}
																</div>
																<div
																	className={`flex h-5 w-5 items-center justify-center rounded-md border ${
																		item.checked
																			? 'border-primary bg-primary text-white'
																			: 'border-primary/70 bg-white text-transparent'
																	}`}
																>
																	<HugeiconsIcon
																		icon={Checkmark}
																		className='h-3 w-3'
																		strokeWidth={3}
																	/>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										))}
									</div>

									<div className='absolute bottom-0 z-20 w-full border-t border-slate-100 bg-white/96 px-3 pb-2 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]'>
										<div className='mb-2 grid grid-cols-2 gap-2'>
											<button
												type='button'
												className='h-8 rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-slate-700'
											>
												Cancel Shopping
											</button>
											<button
												type='button'
												className='h-8 rounded-md bg-primary text-[10px] font-bold text-white shadow-sm'
											>
												Complete Shopping
											</button>
										</div>
										<button
											type='button'
											className='flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-white text-[10px] font-semibold text-slate-700'
										>
											<span className='text-sm leading-none'>+</span>
											Add Item
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className='mt-16 grid w-full max-w-[320px] grid-cols-2 gap-2 md:hidden'>
							{mobileHeroBadges.map(badge => (
								<div
									key={badge.label}
									className='inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_12px_22px_-24px_rgba(15,23,42,0.28)] backdrop-blur'
								>
									<span className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary/10 text-primary'>
										<HugeiconsIcon
											icon={badge.icon}
											className='h-2.5 w-2.5'
										/>
									</span>
									<span className='truncate'>{badge.label}</span>
								</div>
							))}
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* =============================================
			    HOW IT WORKS SECTION
			    ============================================= */}
			<motion.section
				id='how-it-works'
				className='section-neutral-surface relative overflow-hidden py-20 sm:py-24'
				initial='hidden'
				whileInView='show'
				viewport={REVEAL_VIEWPORT}
				variants={STAGGER_REVEAL}
			>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/85 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/85 to-transparent' />

				<div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
					<motion.div
						variants={FADE_UP}
						className='mx-auto max-w-3xl text-center'
					>
						<p className='mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>How it works</p>
						<h2 className='font-serif text-3xl font-extrabold leading-[1.15] tracking-[-0.015em] text-slate-900 sm:text-4xl'>
							Your smart shopping assistant
						</h2>
						<p className='mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600'>
							Listys learns from your receipts to build smarter, reusable lists that make your next grocery run a
							breeze.
						</p>
					</motion.div>

					<motion.div
						className='relative mx-auto mt-12 max-w-6xl'
						variants={FADE_UP}
					>
						<div className='pointer-events-none absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-transparent lg:hidden' />
						<div className='pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent lg:block' />

						<div className='grid gap-4 lg:grid-cols-3 lg:gap-5'>
							{PROCESS_STEPS.map((step, index) => (
								<motion.div
									key={step.title}
									variants={FADE_UP}
									className='relative'
								>
									<div className='absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-white text-xs font-extrabold text-primary shadow-[0_10px_25px_-18px_rgba(37,99,235,0.55)] lg:left-1/2 lg:top-0 lg:-translate-x-1/2 lg:-translate-y-1/2'>
										{index + 1}
									</div>

									<Card className='premium-card relative h-full rounded-2xl border-slate-200/80 bg-white/95 p-5 pt-12 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.22)]'>
										<div className='flex items-start gap-3'>
											<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary'>
												<HugeiconsIcon
													icon={step.icon}
													className='h-4.5 w-4.5'
													strokeWidth={2}
												/>
											</div>
											<div className='min-w-0'>
												<p className='text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'>{step.badge}</p>
												<h3 className='mt-1 text-lg font-bold leading-tight text-slate-900'>{step.title}</h3>
											</div>
										</div>

										<p className='mt-4 text-sm leading-[1.65] text-slate-600'>{step.desc}</p>

										<div className='mt-5 flex items-center gap-2'>
											<span className='h-1.5 w-1.5 rounded-full bg-primary/70' />
											<p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
												{index === 0
													? 'Up to 5 photos per scan'
													: index === 1
														? 'Your lists get smarter over time'
														: 'Items sorted by your habits'}
											</p>
										</div>
									</Card>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* =============================================
			    SHARED LISTS SHOWCASE SECTION
			    ============================================= */}
			<SharedListsShowcase />

			{/* =============================================
			    TRUST STATS SECTION
			    =============================================
			 <motion.section
				className='section-soft-surface relative overflow-hidden py-14'
				initial='hidden'
				whileInView='show'
				viewport={REVEAL_VIEWPORT}
				variants={STAGGER_REVEAL}
			>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/65 to-transparent' />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8'>
					{TRUST_STATS.map((item, index) => (
						<motion.div
							key={item.label}
							variants={FADE_UP}
						>
							<Card className='premium-card rounded-2xl border-slate-200/70 bg-white/90 p-6 text-center transition-all duration-300 hover:-translate-y-0.5'>
								<div
									className={`mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${STAT_ACCENTS[index].icon}`}
								>
									<HugeiconsIcon
										icon={item.icon}
										className='h-5 w-5'
									/>
								</div>
								<p className={`tabular-nums text-2xl font-extrabold ${STAT_ACCENTS[index].stat}`}>{item.stat}</p>
								<p className={`mt-2 text-[11px] font-semibold uppercase `}>{item.label}</p>
							</Card>
						</motion.div>
					))}
				</div>
			</motion.section>

			*/}

			{/* =============================================
			    FEATURES SECTION
			    =============================================
			<motion.section
				className='relative overflow-hidden py-20 sm:py-24'
				initial='hidden'
				whileInView='show'
				viewport={REVEAL_VIEWPORT}
				variants={STAGGER_REVEAL}
			>
				<div className='relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
					<motion.div
						className='mx-auto max-w-2xl text-center'
						variants={FADE_UP}
					>
						<p className='text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>Everything in one flow</p>
						<h2 className='mt-3 font-serif text-3xl font-extrabold tracking-[-0.015em] text-slate-900 sm:text-4xl'>
							Built for faster grocery runs
						</h2>
						<p className='mt-5 text-base text-slate-600 sm:text-lg'>
							Capture receipts, coordinate the household, shop faster, and keep spending visible.
						</p>
					</motion.div>

					<div className='mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
						{FEATURE_CARDS.map((feature, index) => (
							<motion.div
								key={feature.title}
								variants={FADE_UP}
							>
								<Card className='premium-card group rounded-2xl border-slate-200/70 bg-white/95 p-6 transition duration-300 hover:-translate-y-0.5'>
									<div
										className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-colors ${FEATURE_ACCENTS[index].icon}`}
									>
										<HugeiconsIcon
											icon={feature.icon}
											className='h-6 w-6'
										/>
									</div>
									<h3 className={`text-lg font-bold  ${STAT_ACCENTS[index].label}`}>{feature.title}</h3>
									<p className='mt-2.5 text-sm leading-relaxed text-slate-600'>{feature.desc}</p>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			*/}

			{/* =============================================
			    FAQ SECTION
			    ============================================= */}
			<Faq />

			{/* =============================================
			    CTA FINAL SECTION
			    ============================================= */}
			<motion.section
				id='get-started'
				className='section-soft-surface relative overflow-hidden pb-12 pt-20 sm:pt-24'
				initial='hidden'
				whileInView='show'
				viewport={REVEAL_VIEWPORT}
				variants={STAGGER_REVEAL}
			>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/90 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-white/65 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/90 to-transparent' />
				<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.08),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(14,165,233,0.06),transparent_34%)]' />
				<div className='relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8'>
					<motion.div
						className='text-center lg:text-left'
						variants={FADE_UP}
					>
						<p className='mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/85'>Start free today</p>
						<h2 className='font-serif text-4xl font-extrabold leading-[1.12] tracking-[-0.015em] text-foreground sm:text-5xl'>
							Create your first shared shopping list in minutes
						</h2>
						<p className='mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg'>
							Create a free account, upload one receipt, and get a ready-to-shop list your household can use right away.
						</p>
						<div className='flex flex-col gap-4 sm:flex-row lg:justify-start'>
							<motion.div
								className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'
								variants={FADE_UP}
							>
								<Button
									size='lg'
									className='group h-14 w-full max-w-70 rounded-xl border border-white/10 px-10 text-lg font-bold shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/20 transition-all hover:-translate-y-1 hover:opacity-95 sm:w-auto'
									asChild
								>
									<Link
										href='/auth/signup'
										className='flex items-center gap-2'
									>
										Create free account
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className='h-5 w-5 transition-transform group-hover:translate-x-1'
										/>
									</Link>
								</Button>
							</motion.div>
						</div>
					</motion.div>
					<motion.div variants={FADE_UP}>
						<Card className='w-full max-w-sm rounded-2xl border-border/70 bg-card/90 p-6 text-card-foreground shadow-[0_18px_38px_-28px_rgba(15,23,42,0.22)] backdrop-blur-sm'>
							<p className='text-[11px] font-bold uppercase tracking-[0.15em] text-primary/85'>Outcome snapshot</p>
							<div className='mt-4 space-y-4'>
								<div className='border-border/70 flex items-center justify-between border-b pb-4'>
									<div>
										<p className='text-5xl font-extrabold leading-none'>1k+</p>
										<p className='mt-1 text-xs font-bold uppercase tracking-wide '>Users</p>
									</div>
									<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600'>
										<HugeiconsIcon
											icon={Share02Icon}
											className='h-4 w-4'
										/>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-5xl font-extrabold leading-none'>5k+</p>
										<p className='mt-1 text-xs font-bold uppercase tracking-wide '>Receipts processed</p>
									</div>
									<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-primary'>
										<HugeiconsIcon
											icon={ViewIcon}
											className='h-4 w-4'
										/>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>
			</motion.section>

			{/* =============================================
			    FOOTER
			    ============================================= */}
			<Footer />
		</div>
	)
}
