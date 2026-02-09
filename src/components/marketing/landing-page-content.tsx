'use client'

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	ArrowRight01Icon,
	Invoice01Icon,
	ArtificialIntelligence02Icon,
	ShoppingCart01Icon,
	CheckmarkCircle02Icon,
	Camera01Icon,
	AnalyticsUpIcon,
	Layers01Icon,
	ViewIcon,
	SparklesIcon,
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
			desc: 'Before typing, searching, or guessing — Listys helps you capture everything instantly from any receipt.',
			icon: Camera01Icon,
			image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', // Receipt/Scanning
		},
		{
			title: 'Understand your spending',
			desc: 'Listys automatically categorizes your items so you can see exactly where your money goes.',
			icon: AnalyticsUpIcon,
			image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600', // Analytics/Charts
		},
		{
			title: 'Check in with your lists',
			desc: 'Keep your shopping organized. Create, edit, and share lists with your family in seconds.',
			icon: Layers01Icon,
			image: 'https://images.unsplash.com/photo-1598971861752-5a2b3612dc37?auto=format&fit=crop&q=80&w=600', // Lists/Planning
		},
		{
			title: 'Growth without pressure',
			desc: 'Track your habits over time and save money at your own pace with smart insights.',
			icon: SparklesIcon,
			image: 'https://images.unsplash.com/photo-1499296844971-ce45f448c48a?auto=format&fit=crop&q=80&w=600', // Relax/Growth
		},
	]
	return (
		<div className='relative w-full overflow-hidden'>
			{/* Modern background blobs layer */}
			<div className='fixed inset-0 -z-20 bg-background' />
			<div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 80, 0],
						y: [0, -40, 0],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					className='absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[100px]'
				/>
				<motion.div
					animate={{
						scale: [1, 1.1, 1],
						x: [0, -70, 0],
						y: [0, 60, 0],
					}}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					className='absolute top-[15%] -right-[15%] w-[50%] h-[50%] rounded-full bg-accent/30 blur-[80px]'
				/>
				<motion.div
					animate={{
						scale: [1, 1.3, 1],
						y: [0, 50, 0],
						x: [0, 30, 0],
					}}
					transition={{
						duration: 30,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					className='absolute -bottom-[15%] left-[5%] w-[55%] h-[55%] rounded-full bg-primary/15 blur-[120px]'
				/>
			</div>
			<div className='fixed top-0 left-0 w-full h-full -z-10 opacity-[0.03] pointer-events-none bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' />

			{/* Hero Section */}
			<section className='relative w-full pt-20 pb-24 lg:pt-32 overflow-hidden'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='flex flex-col md:flex-row items-center gap-12 lg:gap-20'>
						{/* Left Content (Text) */}
						<div className='flex-1 text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards'>
							{/* Badge */}
							<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide w-fit mx-auto md:mx-0'>
								<HugeiconsIcon
									icon={SparklesIcon}
									className='w-4 h-4 text-amber-400 animate-pulse'
								/>
								<span>AI-Powered Receipt Scanning</span>
							</div>

							<h1 className='text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight text-balance'>
								Turn Receipts into <br />
								<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 relative drop-shadow-sm'>
									Smart Shopping Lists
								</span>
							</h1>

							<p className='text-xl text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0'>
								Stop manually typing items. Just snap a photo of any receipt, and Listys instantly organizes
								everything for your next trip.
							</p>

							<div className='flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start'>
								<Button
									size='lg'
									className='bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 active:scale-95 text-lg group'
									asChild
								>
									<Link
										href='/auth/signup'
										className='flex items-center gap-2'
									>
										Start for Free
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className='w-5 h-5 transition-transform group-hover:translate-x-1'
										/>
									</Link>
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='h-14 px-8 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95'
									asChild
								>
									<Link href='#how-it-works'>How it Works</Link>
								</Button>
							</div>

							<div className='flex items-center gap-6 pt-4 justify-center md:justify-start text-sm font-medium text-slate-500'>
								<div className='flex items-center gap-2'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-emerald-500'
									/>
									<span>No credit card needed</span>
								</div>
								<div className='flex items-center gap-2'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-emerald-500'
									/>
									<span>99% Accuracy</span>
								</div>
							</div>
						</div>

						{/* Right Content (Visual) */}
						<div className='flex-1 relative w-full max-w-lg lg:max-w-xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 fill-mode-forwards'>
							{/* Background blobs for Hero */}
							<div className='absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob'></div>
							<div className='absolute -bottom-20 -left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000'></div>
							<div className='absolute top-20 left-20 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000'></div>

							<div className='relative transform hover:scale-[1.02] transition-transform duration-500'>
								{/* Glassmorphism Card */}
								<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-slate-200/50'>
									<div className='space-y-6'>
										<div className='flex items-start justify-between border-b border-slate-100 pb-4'>
											<div>
												<p className='text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1'>
													<HugeiconsIcon
														icon={Invoice01Icon}
														className='w-3.5 h-3.5'
													/>
													Scanned Just Now
												</p>
												<h3 className='text-2xl font-bold text-slate-900'>Whole Foods Market</h3>
												<p className='text-sm text-slate-500'>Sep 24, 2026 • 2:45 PM</p>
											</div>
											<div className='flex flex-col items-end gap-1'>
												<span className='text-sm font-bold text-white bg-slate-900 px-3 py-1 rounded-full shadow-sm'>
													6 items
												</span>
											</div>
										</div>

										{/* Items List */}
										<div className='space-y-3'>
											{[
												{ emoji: '🥬', name: 'Organic Romaine Hearts', price: '$4.99', qty: '1' },
												{
													emoji: '🍗',
													name: 'Boneless Chicken Breast',
													price: '$12.45',
													qty: '1.5 lb',
												},
												{ emoji: '🥛', name: 'Whole Milk - Gallon', price: '$5.29', qty: '1' },
											].map((item, i) => (
												<div
													key={i}
													className='group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2'
													style={{ animationDelay: `${600 + i * 150}ms`, animationFillMode: 'backwards' }}
												>
													<div className='flex items-center gap-4'>
														<span className='text-2xl bg-slate-50 w-10 h-10 flex items-center justify-center rounded-full transition-transform group-hover:scale-110'>
															{item.emoji}
														</span>
														<div>
															<p className='font-semibold text-slate-800 text-sm'>{item.name}</p>
															<p className='text-xs text-slate-500'>Qty: {item.qty}</p>
														</div>
													</div>
													<span className='font-bold text-slate-900'>{item.price}</span>
												</div>
											))}
										</div>

										{/* Total */}
										<div className='mt-2 pt-4 border-t border-slate-100 flex justify-between items-end'>
											<span className='text-sm font-semibold text-slate-500'>Total Amount</span>
											<span className='text-3xl font-extrabold text-primary'>$22.73</span>
										</div>
									</div>
								</Card>

								{/* Floating Stats Card */}
								<div className='absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-700 delay-500 fill-mode-forwards hidden sm:block'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center'>
											<HugeiconsIcon
												icon={CheckmarkCircle02Icon}
												className='w-5 h-5 text-emerald-600'
											/>
										</div>
										<div>
											<p className='text-xs text-slate-500 font-medium uppercase'>Scan Success</p>
											<p className='text-lg font-bold text-slate-900'>100% Match</p>
										</div>
									</div>
								</div>

								{/* Decorative Floating Elements */}
								<motion.div
									animate={{ y: [0, -15, 0] }}
									transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
									className='absolute -top-12 -right-8 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 hidden lg:block'
								>
									<span className='text-3xl'>🛒</span>
								</motion.div>
								<motion.div
									animate={{ y: [0, 12, 0] }}
									transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
									className='absolute top-1/2 -left-16 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 hidden xl:block'
								>
									<span className='text-3xl'>🍎</span>
								</motion.div>
								<motion.div
									animate={{ y: [0, -10, 0] }}
									transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
									className='absolute bottom-1/4 -right-12 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 hidden lg:block'
								>
									<span className='text-3xl'>🧴</span>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</section>


			{/* How It Works - Reference Layout */}
			<section
				id='how-it-works'
				className='w-full py-32 relative overflow-hidden'
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
						{/* Left Content - Steps */}
						<div className='space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-forwards'>
							<div>
								<h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-6 text-balance'>
									How Listys supports you
								</h2>
								<p className='text-lg text-slate-600 max-w-md'>
									Step by step — a gentle flow designed to organize your shopping without the
									hassle.
								</p>
							</div>

							<div className='space-y-4'>
								{STEPS.map((step, index) => (
									<div
										key={index}
										onClick={() => setActiveStep(index)}
										className={`transition-all duration-300 cursor-pointer active:scale-[0.98] ${
											activeStep === index
												? 'p-8 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm'
												: 'p-6 rounded-3xl hover:bg-slate-50/50 group'
										}`}
									>
										<div className='flex justify-between items-center mb-2'>
											<div className='flex items-center gap-3'>
												<span className={`text-sm font-bold tabular-nums transition-colors ${
													activeStep === index ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400'
												}`}>
													{String(index + 1).padStart(2, '0')}
												</span>
												<h3
													className={`text-xl font-bold transition-colors ${
														activeStep === index
															? 'text-slate-900'
															: 'text-slate-400 group-hover:text-slate-600'
													}`}
												>
													{step.title}
												</h3>
											</div>
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
													activeStep === index
														? 'bg-slate-200/50 rotate-180'
														: 'bg-transparent group-hover:bg-slate-100'
												}`}
											>
												<HugeiconsIcon
													icon={step.icon}
													className={`w-4 h-4 transition-colors ${
														activeStep === index
															? 'text-slate-900'
															: 'text-slate-400 group-hover:text-slate-600'
													}`}
												/>
											</div>
										</div>
										<div
											className={`grid transition-all duration-300 ease-in-out ${
												activeStep === index
													? 'grid-rows-[1fr] opacity-100 mt-2'
													: 'grid-rows-[0fr] opacity-0'
											}`}
										>
											<div className='overflow-hidden'>
												<p className='text-slate-600 leading-relaxed'>{step.desc}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Right Content - Phone Visual */}
						<div className='relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 fill-mode-forwards'>
							{/* Decorative Background Elements */}
							<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/15 via-accent/20 to-amber-100/30 rounded-full blur-3xl -z-10'></div>

							{/* Phone Mockup */}
							<div className='relative w-[280px] sm:w-[300px]'>
								<div className='relative z-20 rounded-[45px] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden h-[580px] sm:h-[620px] aspect-[9/19]'>
									{/* Dynamic Island / Notch */}
									<div className='absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-slate-900 rounded-full z-30'></div>
									
									{/* Content inside phone */}
									<div className='w-full h-full bg-white relative'>
										<div className='absolute inset-0 w-full h-full'>
											<Image
												key={activeStep}
												src={STEPS[activeStep].image}
												alt={STEPS[activeStep].title}
												fill
												className='object-cover object-center animate-in fade-in zoom-in-95 duration-500'
												sizes='(max-width: 640px) 100vw, 300px'
												priority
											/>
										</div>
										
										{/* Overlay Gradient at bottom */}
										<div className='absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none'></div>

										{/* Floating Card inside Phone - Dynamic based on activeStep */}
										<div className='absolute bottom-8 left-4 right-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/20 text-center transition-all duration-500'>
											<h4 className='text-lg font-bold text-slate-900 mb-1'>
												{STEPS[activeStep].title}
											</h4>
											<p className='text-xs text-slate-500 mb-4 line-clamp-2'>
												{STEPS[activeStep].desc}
											</p>
											<Button
												size='sm'
												className='w-full rounded-xl bg-slate-900 text-white h-9'
											>
												Get Started
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid - Packed with Power - Bento Style */}
			<section className='w-full py-24  relative overflow-hidden'>
				{/* Decorative Background Elements */}
				<div className='absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl'></div>
				<div className='absolute bottom-20 right-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl'></div>
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl'></div>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					{/* Header */}
					<div className='text-center mb-16 max-w-2xl mx-auto'>
						<h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4'>
							A path to shopping better
						</h2>
						<p className='text-lg text-slate-600 leading-relaxed'>
							Listys helps you understand what's going on beneath the surface, without judgment and
							without pressure.
						</p>
					</div>

					{/* Bento Grid Layout */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
						{/* Card 1 - Track your lists (Tall Left) */}
						<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-8 overflow-hidden group md:row-span-2 active:scale-[0.99]'>
							{/* Decorative emoji */}
							<div className='absolute top-6 right-6 text-7xl opacity-30 group-hover:opacity-40 transition-all group-hover:scale-110 group-hover:-rotate-6 duration-500'>
								📋
							</div>
							<div className='relative z-10 h-full flex flex-col justify-end'>
								<h3 className='text-2xl font-bold text-slate-900 mb-3'>Track your lists</h3>
								<p className='text-slate-600 leading-relaxed'>
									Capture how you shop throughout the day with quick, intuitive check-ins.
								</p>
							</div>
						</Card>

						{/* Card 2 - Spot the patterns (Top Right) */}
						<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-amber-300/50 transition-all duration-300 p-8 overflow-hidden group lg:col-span-2 active:scale-[0.99]'>
							{/* Decorative elements - circles pattern */}
							<div className='absolute top-1/2 right-8 -translate-y-1/2 flex gap-3 transition-transform group-hover:translate-x-1'>
								<div className='w-12 h-12 rounded-full bg-amber-200/50 group-hover:bg-amber-300/60 transition-colors'></div>
								<div className='w-10 h-10 rounded-full bg-amber-300/50 group-hover:bg-amber-400/60 transition-colors'></div>
								<div className='w-8 h-8 rounded-full bg-amber-200/40'></div>
							</div>
							<div className='absolute top-1/2 right-20 -translate-y-1/2 translate-x-8 flex gap-2 transition-transform group-hover:-translate-x-1'>
								<div className='w-6 h-6 rounded-full bg-amber-200/40'></div>
								<div className='w-5 h-5 rounded-full bg-amber-300/40'></div>
							</div>
							<div className='relative z-10 max-w-md'>
								<h3 className='text-2xl font-bold text-slate-900 mb-3'>Spot the patterns</h3>
								<p className='text-slate-600 leading-relaxed'>
									See the cycles, triggers, and habits shaping your shopping world, presented clearly,
									not clinically.
								</p>
							</div>
						</Card>

						{/* Card 3 - Get gentle guidance (Bottom Left of Right Section) */}
						<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-8 overflow-hidden group active:scale-[0.99]'>
							{/* Decorative elements - purple circles */}
							<div className='absolute bottom-6 left-6 flex gap-2 transition-transform group-hover:translate-y-1'>
								<div className='w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors'></div>
								<div className='w-9 h-9 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors'></div>
								<div className='w-6 h-6 rounded-full bg-primary/10'></div>
							</div>
							<div className='relative z-10'>
								<h3 className='text-xl font-bold text-slate-900 mb-3'>Get gentle guidance</h3>
								<p className='text-slate-600 leading-relaxed'>
									Dive into insights, reflections, and community answers tailored to what you're
									experiencing.
								</p>
							</div>
						</Card>

						{/* Card 4 - Grow at your pace (Bottom Right) */}
						<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-amber-300/50 transition-all duration-300 p-8 overflow-hidden group active:scale-[0.99]'>
							{/* Decorative elements - tags/badges */}
							<div className='absolute top-6 right-6 flex flex-wrap gap-2 max-w-[160px] opacity-30 group-hover:opacity-50 transition-all group-hover:-translate-y-1'>
								<span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium'>
									Anxious
								</span>
								<span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>
									Happy
								</span>
								<span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium'>
									Upset
								</span>
								<span className='px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium'>
									Excited
								</span>
							</div>
							<div className='relative z-10'>
								<h3 className='text-xl font-bold text-slate-900 mb-3'>Grow at your pace</h3>
								<p className='text-slate-600 leading-relaxed'>
									Listys gives you tools, not timelines. You evolve when you're ready.
								</p>
							</div>
						</Card>
					</div>

				</div>
			</section>

			<Faq />

						{/* Stats Section */}
			<section className='w-full py-16 '>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
						{[
							{
								stat: '99%',
								label: 'OCR Accuracy',
								icon: ViewIcon,
								color: 'bg-teal-100 text-teal-600',
							},
							{
								stat: '10',
								label: 'Groups per User',
								icon: Layers01Icon,
								color: 'bg-primary/10 text-primary',
							},
							{
								stat: '250',
								label: 'Items per List',
								icon: ShoppingCart01Icon,
								color: 'bg-cyan-100 text-cyan-600',
							},
							{
								stat: '4.9★',
								label: 'User Rating',
								icon: CheckmarkCircle02Icon,
								color: 'bg-amber-100 text-amber-600',
							},
						].map((item, i) => (
							<div
								key={i}
								className='text-center group'
							>
								<div
									className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md`}
								>
									<HugeiconsIcon
										icon={item.icon}
										className='w-7 h-7'
									/>
								</div>
								<div className='text-3xl font-bold text-slate-900 mb-1 tabular-nums'>{item.stat}</div>
								<p className='text-slate-500 text-sm font-medium'>{item.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>


			{/* CTA */}
			<section className='w-full py-24 bg-gradient-to-b from-transparent via-primary/5 to-primary/10 relative'>
				{/* Decorative background pattern */}
				<div className='absolute inset-0 opacity-[0.02] pointer-events-none bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' />
				<div className='max-w-4xl mx-auto text-center relative z-10'>
					<h2 className='text-4xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight'>
						Ready to shop smarter?
					</h2>
					<p className='text-xl text-slate-600 mb-10'>Join thousands of users saving time with Listys.</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							size='lg'
							className='bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-xl text-lg shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 group'
							asChild
						>
							<Link
								href='/auth/signup'
								className='flex items-center gap-2'
							>
								Get Started Now
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className='w-5 h-5 transition-transform group-hover:translate-x-1'
								/>
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	)
}
