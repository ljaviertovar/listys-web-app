'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	ArrowRight01Icon,
	Invoice01Icon,
	CheckmarkCircle02Icon,
	Camera01Icon,
	AnalyticsUpIcon,
	Layers01Icon,
	ViewIcon,
	SparklesIcon,
	ShoppingCart01Icon,
	ArtificialIntelligence02Icon,
	CheckmarkBadge01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Footer } from '@/components/marketing/footer'
import { Faq } from '@/components/marketing/faq'

export default function LandingPageContent() {
	const [activeStep, setActiveStep] = useState(0)

	const STEPS = [
		{
			title: 'Capture in a snap',
			desc: 'Instant typing, scanning, or guessing — Listys helps you capture everything from everyday grocery receipts with ease.',
			icon: Camera01Icon,
		},
		{
			title: 'Understand your spending',
			desc: 'Categorize items immediately and see exactly where your grocery budget goes each week without doing the math.',
			icon: AnalyticsUpIcon,
		},
		{
			title: 'Check in with your lists',
			desc: "Stay organized while you shop. Check items off and see what's left to get in real-time, synced across your devices.",
			icon: Layers01Icon,
		},
	]

	return (
		<div className='relative w-full overflow-hidden bg-white'>
			{/* Modern gradient mesh background */}
			<div className='fixed inset-0 -z-10 bg-white'>
				<div className='absolute inset-0 bg-[radial-gradient(at_40%_20%,hsl(259.8,58.9%,56.3%/0.3)_0px,transparent_50%),radial-gradient(at_80%_0%,hsl(300,58.9%,51.3%/0.25)_0px,transparent_50%),radial-gradient(at_0%_50%,hsl(240,58.9%,46.3%/0.2)_0px,transparent_50%)]' />
			</div>

			{/* Hero Section */}
			<section className='relative pt-32 pb-24 overflow-hidden'>
				<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
					<div className='mb-12 max-w-3xl mx-auto'>
						{/* Badge */}
						<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide mb-8'>
							<HugeiconsIcon
								icon={SparklesIcon}
								className='w-4 h-4 text-amber-400 animate-pulse'
							/>
							<span>AI-Powered Receipt Scanning</span>
						</div>

						<h1 className='text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-balance drop-shadow-sm'>
							Turn Receipts into <br />
							<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-700'>
								Smart Shopping Lists
							</span>
						</h1>

						<p className='text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance font-medium'>
							Stop manually typing items. Just snap a photo of any grocery receipt, and Listys instantly organizes your
							shopping list and tracks your spending.
						</p>

						<div className='mt-10 flex flex-col sm:flex-row justify-center items-center gap-4'>
							<Button
								size='lg'
								className='bg-primary hover:opacity-95 text-white text-lg font-bold h-14 px-10 rounded-md shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 w-full sm:w-auto border border-white/10 ring-2 ring-primary/20 group'
								asChild
							>
								<Link
									href='/auth/signup'
									className='flex items-center gap-2'
								>
									Start My First List
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										className='w-5 h-5 transition-transform group-hover:translate-x-1'
									/>
								</Link>
							</Button>

							<div className='hidden sm:flex items-center gap-6 text-sm text-slate-500 font-bold'>
								<span className='flex items-center gap-1.5'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-primary'
									/>
									No more manual entry
								</span>
								<span className='flex items-center gap-1.5'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-primary'
									/>
									Automatic categorization
								</span>
							</div>
						</div>
					</div>

					{/* Hero Visual */}
					<div className='relative mt-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-20'>
						{/* Floating icon left */}
						<motion.div
							animate={{ y: [0, -15, 0] }}
							transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
							className='absolute -left-12 top-1/4 hidden lg:block z-20'
						>
							<div className='w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-md shadow-lg flex items-center justify-center transform rotate-12'>
								<HugeiconsIcon
									icon={ShoppingCart01Icon}
									className='w-8 h-8 text-white'
								/>
							</div>
						</motion.div>

						{/* Receipt Card */}
						<div className='relative w-full max-w-[300px] transform -rotate-2 transition hover:rotate-0 duration-500 z-10'>
							<Card className='bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 relative overflow-hidden'>
								{/* Scan line animation */}
								<motion.div
									animate={{ top: ['0%', '100%'] }}
									transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
									className='absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-100 z-20'
									style={{ boxShadow: '0 0 25px 4px hsl(var(--primary))' }}
								/>

								<div className='space-y-4 font-mono text-sm relative'>
									<div className='flex justify-between items-start mb-6'>
										<div className='flex flex-col'>
											<span className='font-bold text-lg text-slate-800'>MARKET FRESH</span>
											<span className='text-[10px] text-slate-400'>123 Green Avenue, CA</span>
										</div>
										<div className='text-[10px] text-right text-slate-400'>
											05/24/2024
											<br />
											14:22:01
										</div>
									</div>

									<div className='flex justify-between text-[10px] text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100'>
										<span>Item Description</span>
										<span>Price</span>
									</div>

									<div className='space-y-2'>
										<div className='flex justify-between text-slate-700'>
											<span>ORGANIC STRAWBERRIES</span>
											<span>$5.99</span>
										</div>
										<div className='flex justify-between text-slate-700'>
											<span>ALMOND MILK</span>
											<span>$4.50</span>
										</div>
										<div className='flex justify-between text-slate-700'>
											<span>SOURDOUGH BREAD</span>
											<span>$5.25</span>
										</div>
										<div className='flex justify-between text-slate-700'>
											<span>AVOCADOS (3)</span>
											<span>$4.99</span>
										</div>
										<div className='flex justify-between text-slate-700'>
											<span>GREEK YOGURT</span>
											<span>$6.50</span>
										</div>
									</div>

									<div className='border-t border-dashed border-slate-300 my-4 pt-4'></div>

									<div className='flex justify-between text-lg font-bold text-slate-900'>
										<span>TOTAL</span>
										<span>$27.23</span>
									</div>

									<div className='mt-8 flex flex-col items-center gap-2 opacity-50'>
										<div className='h-8 w-full bg-[linear-gradient(90deg,transparent_0%,transparent_45%,#000_45%,#000_55%,transparent_55%,transparent_100%)] bg-[length:8px_100%]'></div>
										<span className='text-[10px]'>THANK YOU FOR SHOPPING</span>
									</div>
								</div>
							</Card>
						</div>

						{/* Arrow */}
						<div className='hidden md:block text-primary/40 animate-pulse'>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className='w-16 h-16'
							/>
						</div>

						{/* Phone mockup */}
						<div className='relative w-full max-w-[320px] z-10'>
							<div className='bg-slate-900 rounded-[2.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(66,71,200,0.5)] border-[6px] border-slate-800 relative ring-1 ring-white/10'>
								{/* Notch */}
								<div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30'></div>

								<div className='bg-white rounded-[2rem] overflow-hidden h-[600px] relative flex flex-col'>
									{/* Status bar */}
									<div className='h-12 flex justify-between items-center px-8 pt-3 pb-1'>
										<span className='text-[12px] font-bold text-slate-900 ml-2'>9:41</span>
										<div className='flex gap-1.5 items-center mr-2'>
											<div className='w-4 h-3 border border-slate-900 rounded-sm relative'>
												<div className='absolute inset-0.5 bg-slate-900 rounded-[1px]'></div>
											</div>
										</div>
									</div>

									{/* App header */}
									<div className='px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-slate-50'>
										<h4 className='font-extrabold text-2xl text-slate-900'>Groceries</h4>
										<button className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-105 transition-transform'>
											<span className='text-lg font-bold'>+</span>
										</button>
									</div>

									{/* List items */}
									<div className='px-5 py-2 space-y-4 flex-1 overflow-y-auto pb-20'>
										{/* Checked items */}
										<div className='flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-slate-100 transition hover:shadow-md hover:border-blue-100 cursor-pointer'>
											<div className='w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0'>
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													className='w-4 h-4'
												/>
											</div>
											<div className='flex-1'>
												<p className='text-sm font-bold text-slate-800'>Organic Strawberries</p>
												<p className='text-[11px] text-slate-400 font-medium'>Produce • $5.99</p>
											</div>
										</div>

										<div className='flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-slate-100 transition hover:shadow-md hover:border-blue-100 cursor-pointer'>
											<div className='w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0'>
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													className='w-4 h-4'
												/>
											</div>
											<div className='flex-1'>
												<p className='text-sm font-bold text-slate-800'>Almond Milk</p>
												<p className='text-[11px] text-slate-400 font-medium'>Dairy • $4.50</p>
											</div>
										</div>

										{/* Unchecked items */}
										<div className='flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-slate-100 transition hover:shadow-md hover:border-blue-100 cursor-pointer'>
											<div className='w-6 h-6 rounded-md border-2 border-slate-200 flex-shrink-0'></div>
											<div className='flex-1'>
												<p className='text-sm font-bold text-slate-800'>Sourdough Bread</p>
												<p className='text-[11px] text-slate-400 font-medium'>Bakery • $5.25</p>
											</div>
										</div>

										<div className='flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-slate-100 transition hover:shadow-md hover:border-blue-100 cursor-pointer'>
											<div className='w-6 h-6 rounded-md border-2 border-slate-200 flex-shrink-0'></div>
											<div className='flex-1'>
												<p className='text-sm font-bold text-slate-800'>Avocados (3)</p>
												<p className='text-[11px] text-slate-400 font-medium'>Produce • $4.99</p>
											</div>
										</div>

										<div className='flex items-center gap-4 bg-white p-3 rounded-md shadow-sm border border-slate-100 transition hover:shadow-md hover:border-blue-100 cursor-pointer'>
											<div className='w-6 h-6 rounded-md border-2 border-slate-200 flex-shrink-0'></div>
											<div className='flex-1'>
												<p className='text-sm font-bold text-slate-800'>Greek Yogurt</p>
												<p className='text-[11px] text-slate-400 font-medium'>Dairy • $6.50</p>
											</div>
										</div>
									</div>

									{/* Bottom navigation */}
									<div className='absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-20 px-6 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20'>
										<div className='flex flex-col items-center gap-1 text-primary'>
											<HugeiconsIcon
												icon={Layers01Icon}
												className='w-6 h-6'
											/>
											<span className='text-[10px] font-bold'>Lists</span>
										</div>
										<div className='flex flex-col items-center gap-1 text-slate-400'>
											<HugeiconsIcon
												icon={Invoice01Icon}
												className='w-6 h-6'
											/>
											<span className='text-[10px] font-medium'>Scan</span>
										</div>
										<div className='flex flex-col items-center gap-1 text-slate-400'>
											<HugeiconsIcon
												icon={AnalyticsUpIcon}
												className='w-6 h-6'
											/>
											<span className='text-[10px] font-medium'>Stats</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Floating icon right */}
						<motion.div
							animate={{ y: [0, -15, 0] }}
							transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
							className='absolute -right-8 top-1/3 hidden lg:block z-20'
						>
							<div className='w-20 h-20 bg-gradient-to-br from-orange-300 to-red-400 rounded-full shadow-lg flex items-center justify-center transform -rotate-12'>
								<span className='text-4xl'>🥑</span>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-12 bg-slate-50 border-y border-slate-100'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{[
							{ stat: '99%', label: 'OCR Accuracy', icon: ViewIcon, color: 'bg-blue-600' },
							{ stat: '10+', label: 'Group Types', icon: Layers01Icon, color: 'bg-blue-600' },
							{ stat: '250', label: 'Items / List', icon: ShoppingCart01Icon, color: 'bg-blue-600' },
							{ stat: '4.9★', label: 'Rating', icon: CheckmarkBadge01Icon, color: 'bg-blue-600' },
						].map((item, i) => (
							<Card
								key={i}
								className='bg-white p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 border border-slate-100 group'
							>
								<div
									className={`w-12 h-12 ${item.color} text-white rounded-full flex items-center justify-center mb-4 font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform`}
								>
									<HugeiconsIcon
										icon={item.icon}
										className='w-6 h-6'
									/>
								</div>
								<h3 className='text-4xl font-extrabold text-slate-900 mb-1'>{item.stat}</h3>
								<p className='text-sm font-bold text-slate-400 tracking-wide uppercase'>{item.label}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section
				className='py-24 bg-white overflow-hidden'
				id='how-it-works'
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col lg:flex-row items-center gap-16 lg:gap-24'>
						{/* Left - Steps */}
						<div className='lg:w-5/12 space-y-12'>
							<div>
								<h2 className='text-4xl font-extrabold text-slate-900 mb-6 leading-tight'>How Listys supports you</h2>
								<p className='text-lg text-slate-600 leading-relaxed font-medium'>
									Step by step — a gentle flow designed to organize your shopping without the hassle of spreadsheet
									management.
								</p>
							</div>

							<div className='space-y-10'>
								{STEPS.map((step, index) => (
									<div
										key={index}
										onClick={() => setActiveStep(index)}
										className='flex gap-6 items-start group cursor-pointer'
									>
										<div
											className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md transition-colors ${
												activeStep === index
													? 'bg-primary shadow-primary/20'
													: 'border-2 border-slate-200 text-slate-400 bg-white group-hover:border-primary group-hover:text-primary'
											}`}
										>
											{String(index + 1).padStart(2, '0')}
										</div>
										<div>
											<h4 className='text-xl font-bold text-slate-900 mb-2'>{step.title}</h4>
											<p className='text-slate-500 leading-relaxed'>{step.desc}</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Right - Phone Visual */}
						<div className='lg:w-7/12 relative flex justify-center'>
							<div className='relative z-10 bg-slate-900 rounded-[2.8rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-slate-800 w-full max-w-[360px]'>
								<div className='bg-slate-50 h-[680px] rounded-[2.2rem] overflow-hidden relative flex flex-col'>
									{/* Background image */}
									<div className='absolute inset-0 z-0'>
										<div className='w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'></div>
										<div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-5'></div>
									</div>

									<div className='relative z-10 h-full flex flex-col pt-16 px-6 pb-6'>
										{/* Glass card top */}
										<Card className='bg-white/85 backdrop-blur-md p-6 rounded-md mb-6 transform hover:scale-[1.02] transition-transform duration-300 border border-white/60 shadow-lg'>
											<div className='flex justify-between items-start'>
												<div>
													<p className='text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1'>
														Whole Foods Market
													</p>
													<h3 className='text-4xl font-extrabold text-primary tracking-tight'>$22.73</h3>
												</div>
												<div className='bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm'>
													Today
												</div>
											</div>
										</Card>

										{/* Item cards */}
										<div className='space-y-4'>
											{[
												{ icon: '🥑', name: 'Avocados', qty: 'x3 items', price: '$4.99', bg: 'bg-emerald-100' },
												{ icon: '🍞', name: 'Sourdough', qty: 'x1 loaf', price: '$6.50', bg: 'bg-orange-100' },
												{
													icon: '🍓',
													name: 'Strawberries',
													qty: '1 lb box',
													price: '$5.99',
													bg: 'bg-red-100',
												},
											].map((item, i) => (
												<Card
													key={i}
													className='bg-white/85 backdrop-blur-md p-4 rounded-md flex items-center justify-between transition-transform hover:scale-[1.02] cursor-pointer group border-white/50 shadow-md'
												>
													<div className='flex items-center gap-4'>
														<div
															className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform text-xl`}
														>
															{item.icon}
														</div>
														<div>
															<p className='text-base font-bold text-slate-900'>{item.name}</p>
															<p className='text-xs text-slate-600'>{item.qty}</p>
														</div>
													</div>
													<p className='font-bold text-slate-900'>{item.price}</p>
												</Card>
											))}
										</div>

										<div className='mt-auto'>
											<Button className='w-full py-4 bg-slate-900 hover:bg-black text-white rounded-md font-bold text-sm shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2'>
												See Full Shopping List
												<HugeiconsIcon
													icon={ArrowRight01Icon}
													className='w-4 h-4'
												/>
											</Button>
										</div>
									</div>
								</div>
							</div>

							{/* Savings badge */}
							<div className='absolute -bottom-6 right-8 lg:right-16 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold px-6 py-3 rounded-full text-sm shadow-xl shadow-emerald-500/30 border-2 border-white z-30 flex items-center gap-2 transform hover:scale-105 transition-transform'>
								<span className='text-lg'>💰</span>
								Saved $4.20 today!
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className='py-24 bg-slate-50 relative overflow-hidden'>
				<div className='absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none'></div>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-extrabold text-slate-900 mb-4 tracking-tight'>A path to shopping better</h2>
						<p className='text-lg text-slate-600 max-w-2xl mx-auto text-balance font-medium'>
							Listys helps you understand what's going on beneath the surface, without judgment and without pressure.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{[
							{
								title: 'AI Scanning',
								desc: 'Advanced OCR vision detects items instantly, turning a messy grocery receipt into structured data in seconds.',
								icon: ArtificialIntelligence02Icon,
								color: 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
							},
							{
								title: 'Group Organization',
								desc: 'Organize your life by store or event. Create unlimited lists for bulk shopping or weekly prep.',
								icon: Layers01Icon,
								color: 'bg-pink-100 text-pink-700 group-hover:bg-pink-600 group-hover:text-white',
							},
							{
								title: 'Active Sessions',
								desc: "Real-time tracking of what you've picked up. Smart sync ensures your Listys updates across devices.",
								icon: ShoppingCart01Icon,
								color: 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
							},
							{
								title: 'Smart Sync',
								desc: "Seamlessly sync every list across your entire team. Keep track of what you bought or what's on sale.",
								icon: CheckmarkBadge01Icon,
								color: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
							},
						].map((feature, i) => (
							<Card
								key={i}
								className='bg-white p-8 rounded-md shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 group'
							>
								<div
									className={`w-12 h-12 rounded-md flex items-center justify-center mb-6 transition-colors ${feature.color}`}
								>
									<HugeiconsIcon
										icon={feature.icon}
										className='w-6 h-6'
									/>
								</div>
								<h3 className='text-xl font-bold text-slate-900 mb-3'>{feature.title}</h3>
								<p className='text-sm text-slate-500 leading-relaxed font-medium'>{feature.desc}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			<Faq />

			{/* CTA Section */}
			<section className='py-32 bg-[#0a0f1d] relative overflow-hidden flex items-center'>
				<div className='absolute inset-0 bg-gradient-to-b from-[#0a0f1d] via-[#111827] to-[#0a0f1d] z-0'></div>
				<div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(259.8,58.9%,56.3%/0.35)_0%,transparent_60%)] z-0'></div>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full'>
					<div className='flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24'>
						{/* Left - Visual */}
						<div className='relative w-full max-w-md lg:w-1/2 flex justify-center'>
							<motion.div
								animate={{ y: [0, -15, 0] }}
								transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
								className='relative z-10'
							>
								<div className='text-9xl drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]'>🛒</div>
							</motion.div>

							{/* Floating stats card */}
							<motion.div
								animate={{ y: [0, -15, 0] }}
								transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
								className='absolute top-10 -right-4 lg:-right-12 bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-md shadow-2xl z-20 w-64'
							>
								<div className='flex justify-between items-start mb-4'>
									<div>
										<p className='text-xs text-white/70 font-medium'>Monthly Savings</p>
										<p className='text-2xl font-bold text-emerald-400'>+ $184.70</p>
									</div>
									<div className='bg-emerald-500/20 p-2 rounded-md'>
										<HugeiconsIcon
											icon={AnalyticsUpIcon}
											className='w-5 h-5 text-emerald-400'
										/>
									</div>
								</div>
								<div className='space-y-3'>
									<div className='h-2 bg-white/10 rounded-full overflow-hidden'>
										<div className='h-full bg-gradient-to-r from-blue-400 to-purple-500 w-3/4'></div>
									</div>
									<div className='flex justify-between text-[10px] text-white/50'>
										<span>Budget Used</span>
										<span>75%</span>
									</div>
								</div>
							</motion.div>
						</div>

						{/* Right - Content */}
						<div className='text-center lg:text-left lg:w-1/2'>
							<h2 className='text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight'>
								Ready to shop <br />
								<span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300'>
									smarter?
								</span>
							</h2>
							<p className='text-lg text-slate-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed text-balance font-medium'>
								Join thousands of shoppers who have ditched manual lists for Listys. Organize your kitchen and master
								your grocery budget today.
							</p>

							<div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
								<Button
									size='lg'
									className='bg-white text-primary hover:bg-slate-50 text-lg font-bold py-4 px-10 rounded-md shadow-2xl shadow-white/20 transition-all transform hover:-translate-y-1 w-full sm:w-auto group'
									asChild
								>
									<Link
										href='/auth/signup'
										className='flex items-center gap-2'
									>
										Get Started
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className='w-5 h-5 transition-transform group-hover:translate-x-1'
										/>
									</Link>
								</Button>
							</div>

							<div className='mt-12 pt-8 border-t border-slate-800 flex items-center justify-center lg:justify-start gap-8 opacity-70'>
								<div>
									<p className='text-2xl font-bold text-white'>50k+</p>
									<p className='text-xs text-slate-400 uppercase tracking-wider font-bold'>Users</p>
								</div>
								<div className='w-px h-10 bg-slate-800'></div>
								<div>
									<p className='text-2xl font-bold text-white'>1M+</p>
									<p className='text-xs text-slate-400 uppercase tracking-wider font-bold'>Receipts</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	)
}
