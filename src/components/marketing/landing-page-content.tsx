'use client'

// =============================================
// IMPORTS
// =============================================
import { useState } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	ArrowRight01Icon,
	ArtificialIntelligence02Icon,
	AnalyticsUpIcon,
	Camera01Icon,
	CheckmarkBadge01Icon,
	CheckmarkCircle02Icon,
	Layers01Icon,
	ShoppingCart01Icon,
	ViewIcon,
} from '@hugeicons/core-free-icons'
import { Footer } from '@/components/marketing/footer'
import { Faq } from '@/components/marketing/faq'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// =============================================
// CONSTANTS
// =============================================

const TRUST_STATS = [
	{ stat: '99%', label: 'OCR accuracy', icon: ViewIcon },
	{ stat: '10+', label: 'List groups', icon: Layers01Icon },
	{ stat: '250', label: 'Items per list', icon: ShoppingCart01Icon },
	{ stat: '4.9/5', label: 'App store rating', icon: CheckmarkBadge01Icon },
]

const PROCESS_STEPS = [
	{
		title: 'Scan receipt in seconds',
		desc: 'Take a photo and Listys extracts every product, price, and quantity automatically.',
		icon: Camera01Icon,
		badge: 'Capture',
	},
	{
		title: 'Review and organize instantly',
		desc: 'Listys classifies items by category so your next shopping trip is already structured.',
		icon: ArtificialIntelligence02Icon,
		badge: 'Organize',
	},
	{
		title: 'Shop with a focused list',
		desc: 'Track completed items live and keep your spending visible while you shop.',
		icon: AnalyticsUpIcon,
		badge: 'Execute',
	},
]

const PREVIEW_BY_STEP = [
	[
		{ name: 'Organic Strawberries', detail: 'Produce - $5.99', checked: true },
		{ name: 'Almond Milk', detail: 'Dairy - $4.50', checked: true },
		{ name: 'Sourdough Bread', detail: 'Bakery - $5.25', checked: false },
	],
	[
		{ name: 'Avocados (3)', detail: 'Produce - $4.99', checked: true },
		{ name: 'Greek Yogurt', detail: 'Dairy - $6.50', checked: false },
		{ name: 'Sparkling Water', detail: 'Beverages - $4.80', checked: false },
	],
	[
		{ name: 'Chicken Breast', detail: 'Protein - $12.30', checked: true },
		{ name: 'Cherry Tomatoes', detail: 'Produce - $3.75', checked: true },
		{ name: 'Parmesan', detail: 'Dairy - $6.20', checked: false },
	],
]

const FEATURE_CARDS = [
	{
		title: 'AI receipt extraction',
		desc: 'Advanced OCR turns unstructured receipts into clean, editable shopping data.',
		icon: ArtificialIntelligence02Icon,
	},
	{
		title: 'Shared household lists',
		desc: 'Coordinate with family members in one shared space, without duplicated purchases.',
		icon: Layers01Icon,
	},
	{
		title: 'Real-time progress',
		desc: 'Mark products as completed and always know what is left in your current run.',
		icon: ShoppingCart01Icon,
	},
	{
		title: 'Spending visibility',
		desc: 'Understand how much you spend by category and make better decisions every week.',
		icon: AnalyticsUpIcon,
	},
]

const STAT_ACCENTS = [
	{
		icon: 'bg-primary/10 text-primary ring-primary/15',
		stat: 'text-primary',
		label: 'text-primary/80',
	},
	{
		icon: 'bg-chart-2/10 text-chart-2 ring-chart-2/20',
		stat: 'text-chart-2',
		label: 'text-chart-2/80',
	},
	{
		icon: 'bg-chart-3/10 text-chart-3 ring-chart-3/20',
		stat: 'text-chart-3',
		label: 'text-chart-3/80',
	},
	{
		icon: 'bg-chart-4/10 text-chart-4 ring-chart-4/20',
		stat: 'text-chart-4',
		label: 'text-chart-4/80',
	},
]

const FEATURE_ACCENTS = [
	{
		icon: 'bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary group-hover:text-white',
	},
	{
		icon: 'bg-chart-2/10 text-chart-2 ring-chart-2/15 group-hover:bg-chart-2 group-hover:text-white',
	},
	{
		icon: 'bg-chart-3/10 text-chart-3 ring-chart-3/15 group-hover:bg-chart-3 group-hover:text-white',
	},
	{
		icon: 'bg-chart-4/10 text-chart-4 ring-chart-4/15 group-hover:bg-chart-4 group-hover:text-white',
	},
]

// =============================================
// COMPONENT
// =============================================

export function LandingPageContent() {
	const [activeStep, setActiveStep] = useState(0)

	return (
		<div className='relative w-full overflow-hidden bg-slate-50 text-slate-900'>
			{/* =============================================
			    HERO SECTION
			    ============================================= */}
			<section className='hero-mesh relative overflow-hidden pb-20 pt-24 sm:pb-24 sm:pt-28 md:pt-32'>
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent' />
				<div className='relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
					<div className='mx-auto mb-12 max-w-3xl'>
						<h1 className='text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl md:text-7xl'>
							Turn Receipts into <br />
							<span className='bg-gradient-to-r from-primary via-blue-600 to-violet-700 bg-clip-text text-transparent'>
								Smart Shopping Lists
							</span>
						</h1>
						<p className='mx-auto mt-8 max-w-2xl text-balance text-lg font-medium leading-relaxed text-slate-600 md:text-xl'>
							Snap any grocery receipt and instantly turn it into an organized shopping list with real-time spend
							tracking.
						</p>

						<div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
							<Button
								size='lg'
								className='group h-14 w-full rounded-xl border border-white/10 px-10 text-lg font-bold shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/20 transition-all hover:-translate-y-1 hover:opacity-95 sm:w-auto'
								asChild
							>
								<Link
									href='/auth/signup'
									className='flex items-center gap-2'
								>
									Create Free Account
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className='h-5 w-5 transition-transform group-hover:translate-x-1'
									/>
								</Link>
							</Button>
						</div>
					</div>

					<div className='relative mx-auto mt-20 flex max-w-6xl flex-col items-center justify-center gap-8 md:flex-row lg:gap-20'>
						<div className='absolute -left-6 top-[24%] z-20 hidden items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(37,99,235,0.45)] backdrop-blur md:flex lg:-left-10'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
								<HugeiconsIcon
									icon={ViewIcon}
									className='h-3.5 w-3.5'
								/>
							</span>
							OCR 99% accuracy
						</div>
						<div className='absolute -right-6 top-[64%] z-20 hidden items-center gap-2 rounded-full border border-chart-2/25 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_15px_35px_-22px_rgba(14,116,144,0.35)] backdrop-blur md:flex lg:-right-8'>
							<span className='flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-chart-2'>
								<HugeiconsIcon
									icon={Layers01Icon}
									className='h-3.5 w-3.5'
								/>
							</span>
							Auto-categorized
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

									<div className='sticky top-0 z-20 flex items-center justify-between border-b border-slate-50 bg-white/80 px-6 py-4 backdrop-blur'>
										<h4 className='text-2xl font-extrabold text-slate-900'>Groceries</h4>
										<button
											type='button'
											className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105'
										>
											+
										</button>
									</div>

									<div className='flex-1 space-y-4 overflow-y-auto px-5 py-2 pb-20'>
										{[
											{ name: 'Organic Strawberries', detail: 'Produce - $5.99', checked: true },
											{ name: 'Almond Milk', detail: 'Dairy - $4.50', checked: true },
											{ name: 'Sourdough Bread', detail: 'Bakery - $5.25', checked: false },
											{ name: 'Avocados (3)', detail: 'Produce - $4.99', checked: false },
											{ name: 'Greek Yogurt', detail: 'Dairy - $6.50', checked: false },
										].map(item => (
											<div
												key={item.name}
												className='cursor-pointer rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-blue-100 hover:shadow-md'
											>
												<div className='flex items-center gap-4'>
													<div
														className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
															item.checked ? 'bg-primary text-white' : 'border-2 border-slate-200'
														}`}
													>
														{item.checked && (
															<HugeiconsIcon
																icon={CheckmarkCircle02Icon}
																className='h-4 w-4'
															/>
														)}
													</div>
													<div className='flex-1'>
														<p className='text-sm font-bold text-slate-800'>{item.name}</p>
														<p className='text-[11px] font-medium text-slate-500'>{item.detail}</p>
													</div>
												</div>
											</div>
										))}
									</div>

									<div className='absolute bottom-0 z-20 flex h-20 w-full items-center justify-around border-t border-slate-100 bg-white px-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]'>
										<div className='flex flex-col items-center gap-1 text-primary'>
											<HugeiconsIcon
												icon={ShoppingCart01Icon}
												className='h-5 w-5'
											/>
											<span className='text-[10px] font-bold'>Lists</span>
										</div>
										<div className='flex cursor-pointer flex-col items-center gap-1 text-slate-400 transition-colors hover:text-slate-600'>
											<HugeiconsIcon
												icon={Camera01Icon}
												className='h-5 w-5'
											/>
											<span className='text-[10px] font-medium'>Scan</span>
										</div>
										<div className='flex cursor-pointer flex-col items-center gap-1 text-slate-400 transition-colors hover:text-slate-600'>
											<HugeiconsIcon
												icon={AnalyticsUpIcon}
												className='h-5 w-5'
											/>
											<span className='text-[10px] font-medium'>Stats</span>
										</div>
										<div className='flex cursor-pointer flex-col items-center gap-1 text-slate-400 transition-colors hover:text-slate-600'>
											<HugeiconsIcon
												icon={Layers01Icon}
												className='h-5 w-5'
											/>
											<span className='text-[10px] font-medium'>Settings</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* =============================================
			    TRUST STATS SECTION
			    ============================================= */}
			<section className='section-soft-surface relative overflow-hidden py-14'>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/65 to-transparent' />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8'>
					{TRUST_STATS.map((item, index) => (
						<Card
							key={item.label}
							className='premium-card rounded-2xl border-slate-200/70 bg-white/90 p-6 text-center transition-all duration-300 hover:-translate-y-0.5'
						>
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
					))}
				</div>
			</section>

			{/* =============================================
			    HOW IT WORKS SECTION
			    ============================================= */}
			<section
				id='how-it-works'
				className='section-neutral-surface relative overflow-hidden py-20 sm:py-24'
			>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/85 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/85 to-transparent' />
				<div className='mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8'>
					<div>
						<p className='mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>How it works</p>
						<h2 className='font-serif text-3xl font-extrabold leading-[1.15] tracking-[-0.015em] text-slate-900 sm:text-4xl'>
							One clear process from scan to checkout
						</h2>
						<p className='mt-5 max-w-xl text-base leading-relaxed text-slate-600'>
							Each step is designed to keep momentum. Capture fast, organize automatically, then shop with confidence.
						</p>

						<div className='mt-10 space-y-5'>
							{PROCESS_STEPS.map((step, index) => {
								const isActive = activeStep === index
								return (
									<button
										key={step.title}
										onClick={() => setActiveStep(index)}
										className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
											isActive
												? 'border-primary/30 bg-gradient-to-br from-primary/8 to-accent/30 shadow-[0_14px_40px_-24px_rgba(37,99,235,0.55)]'
												: 'border-slate-200/80 bg-white hover:border-accent/45 hover:bg-gradient-to-br hover:from-white hover:to-accent/20'
										}`}
									>
										<div
											className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
												isActive
													? 'bg-primary text-white'
													: 'bg-slate-100 text-slate-500 group-hover:bg-accent group-hover:text-primary'
											}`}
										>
											<HugeiconsIcon
												icon={step.icon}
												className='h-5 w-5'
											/>
										</div>
										<div>
											<p className='text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'>{step.badge}</p>
											<h3 className='mt-1 text-lg font-bold text-slate-900'>{step.title}</h3>
											<p className='mt-1.5 text-sm leading-[1.65] text-slate-600'>{step.desc}</p>
										</div>
									</button>
								)
							})}
						</div>
					</div>

					<div className='relative'>
						<div className='absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/30 to-chart-2/20 blur-2xl' />
						<Card className='premium-card relative rounded-3xl border-slate-200/70 bg-white/95 p-7'>
							<div className='mb-5 flex items-center justify-between'>
								<div>
									<p className='text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500'>
										Current shopping run
									</p>
									<p className='text-2xl font-extrabold text-slate-900'>Groceries</p>
								</div>
								<span className='rounded-full border border-chart-2/25 bg-chart-2/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-chart-2'>
									Step {activeStep + 1}
								</span>
							</div>
							<div className='space-y-3.5'>
								{PREVIEW_BY_STEP[activeStep].map(item => (
									<div
										key={item.name}
										className='flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/75 px-4 py-3'
									>
										<div>
											<p className='text-sm font-bold text-slate-900'>{item.name}</p>
											<p className='text-xs text-slate-500'>{item.detail}</p>
										</div>
										<div
											className={`h-7 w-7 rounded-full border-2 ${item.checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'}`}
										>
											{item.checked && (
												<div className='flex h-full items-center justify-center'>
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														className='h-4 w-4'
													/>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
							<div className='mt-7 rounded-xl border border-chart-5/20 bg-chart-5/10 px-4 py-3'>
								<p className='text-sm font-semibold text-emerald-900'>Estimated savings this month: $184.70</p>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* =============================================
			    FEATURES SECTION
			    ============================================= */}
			<section className='feature-premium-surface relative overflow-hidden py-20 sm:py-24'>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
				<div className='relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-2xl text-center'>
						<p className='text-xs font-bold uppercase tracking-[0.2em] text-primary/80'>Why households choose Listys</p>
						<h2 className='mt-3 font-serif text-3xl font-extrabold tracking-[-0.015em] text-slate-900 sm:text-4xl'>
							Designed for everyday grocery shopping
						</h2>
						<p className='mt-5 text-base text-slate-600 sm:text-lg'>
							Everything stays connected, clean, and easy to act on across the entire shopping cycle.
						</p>
					</div>

					<div className='mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
						{FEATURE_CARDS.map((feature, index) => (
							<Card
								key={feature.title}
								className='premium-card group rounded-2xl border-slate-200/70 bg-white/95 p-6 transition duration-300 hover:-translate-y-0.5'
							>
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
						))}
					</div>
				</div>
			</section>

			{/* =============================================
			    FAQ SECTION
			    ============================================= */}
			<Faq />

			{/* =============================================
			    CTA FINAL SECTION
			    ============================================= */}
			<section className='section-soft-surface relative overflow-hidden pb-12 pt-20 sm:pt-24'>
				<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/90 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-white/65 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/90 to-transparent' />
				<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.08),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(14,165,233,0.06),transparent_34%)]' />
				<div className='relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8'>
					<div className='text-center lg:text-left'>
						<p className='mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/85'>Get started</p>
						<h2 className='font-serif text-4xl font-extrabold leading-[1.12] tracking-[-0.015em] text-foreground sm:text-5xl'>
							Build a smarter shopping habit with Listys
						</h2>
						<p className='text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg'>
							Start free today and organize your next grocery run in minutes with smarter lists and clearer spending.
						</p>
						<div className='mt-10 flex flex-col gap-4 sm:flex-row lg:justify-start'>
							<Button
								size='lg'
								className='h-13 rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-[0_14px_28px_-18px_rgba(37,99,235,0.55)] transition-colors hover:bg-primary/90'
								asChild
							>
								<Link
									href='/auth/signup'
									className='flex items-center gap-2'
								>
									Create free account
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className='h-5 w-5'
									/>
								</Link>
							</Button>
						</div>
					</div>
					<Card className='w-full max-w-sm rounded-2xl border-border/70 bg-card/90 p-6 text-card-foreground shadow-[0_18px_38px_-28px_rgba(15,23,42,0.22)] backdrop-blur-sm'>
						<p className='text-muted-foreground text-[11px] font-bold uppercase tracking-[0.15em]'>Outcome snapshot</p>
						<div className='mt-4 space-y-4'>
							<div className='border-border/70 flex items-center justify-between border-b pb-4'>
								<div>
									<p className='text-5xl font-extrabold leading-none'>50k+</p>
									<p className='text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wide'>Users</p>
								</div>
								<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600'>
									<HugeiconsIcon
										icon={Layers01Icon}
										className='h-4 w-4'
									/>
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-5xl font-extrabold leading-none'>1M+</p>
									<p className='text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wide'>
										Receipts processed
									</p>
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
				</div>
			</section>

			{/* =============================================
			    FOOTER
			    ============================================= */}
			<Footer />
		</div>
	)
}
