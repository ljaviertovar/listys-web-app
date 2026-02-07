import { Metadata } from 'next'

import Link from 'next/link'
import { redirect } from 'next/navigation'

import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing',
}

export default async function Page() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (user) redirect('/dashboard')

	return (
		<div className='w-full overflow-hidden bg-white'>
			{/* Hero Section - Friendly & Vibrant */}
			<section className='relative w-full pt-10 pb-24 lg:pt-20 bg-gradient-to-br from-blue-50 via-purple-50/30 to-white'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex flex-col-reverse justify-between gap-16 items-center md:flex-row'>
						{/* Left Content - Friendly & Engaging */}
						<div className='space-y-8 order-2 lg:order-1'>
							<div className='space-y-6'>
								{/* Badge */}
								<div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20'>
									<HugeiconsIcon
										icon={SparklesIcon}
										className='w-4 h-4 text-primary'
									/>
									<span className='text-sm font-semibold text-primary'>AI-Powered Receipts → Smart Lists</span>
								</div>

								{/* Headline - Bold & Friendly */}
								<h1 className='text-5xl lg:text-6xl font-bold leading-tight text-slate-900'>
									Your Fastest Path
									<br />
									to <span className='text-primary'>Smart Shopping</span>
								</h1>

								{/* Subheadline */}
								<p className='text-lg lg:text-xl text-slate-600 leading-relaxed'>
									Transform receipts into organized shopping lists with AI.
								</p>
							</div>

							{/* CTA Buttons - Vibrant */}
							<div className='flex flex-col sm:flex-row gap-4 pt-2'>
								<Button className='bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/25'>
									<Link
										href='/auth/signup'
										className='flex items-center gap-2 w-full justify-center'
									>
										Get Started Free
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className='w-5 h-5'
										/>
									</Link>
								</Button>
								<Button
									variant='outline'
									className='h-12 px-8 text-base font-semibold border-2 border-slate-300 hover:bg-slate-50 rounded-lg transition-colors'
								>
									<Link
										href='#demo'
										className='flex items-center gap-2'
									>
										See It In Action
									</Link>
								</Button>
							</div>

							{/* Trust Badges */}
							<div className='flex flex-wrap gap-6 pt-4'>
								<div className='flex items-center gap-2'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-emerald-500'
									/>
									<span className='text-sm text-slate-600 font-medium'>No credit card</span>
								</div>
								<div className='flex items-center gap-2'>
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className='w-5 h-5 text-emerald-500'
									/>
									<span className='text-sm text-slate-600 font-medium'>99% accuracy</span>
								</div>
							</div>
						</div>

						{/* Right - Visual Showcase */}
						<div className='relative order-1 lg:order-2'>
							<div className='relative'>
								{/* Main Card - Receipt Preview */}
								<Card className='border border-slate-200 bg-white rounded-xl p-6 shadow-xl shadow-primary/10'>
									<div className='space-y-4'>
										<div className='flex items-start justify-between'>
											<div>
												<p className='text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-2'>
													<HugeiconsIcon
														icon={Invoice01Icon}
														className='w-4 h-4'
													/>{' '}
													Auto-Extracted
												</p>
												<h3 className='text-xl font-bold text-slate-900 mt-1'>Weekly Shopping</h3>
											</div>
											<span className='text-sm font-semibold text-white bg-primary px-3 py-1 rounded-full'>
												6 items
											</span>
										</div>

										{/* Items List */}
										<div className='space-y-2'>
											{[
												{ emoji: '🥬', name: 'Romaine Lettuce', price: '$2.49' },
												{ emoji: '🍗', name: 'Chicken Breast', price: '$8.99' },
												{ emoji: '🥛', name: 'Whole Milk', price: '$3.49' },
											].map((item, i) => (
												<div
													key={i}
													className='flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/30 transition-colors'
												>
													<div className='flex items-center gap-3'>
														<span className='text-xl'>{item.emoji}</span>
														<span className='font-semibold text-slate-700 text-sm'>{item.name}</span>
													</div>
													<span className='font-semibold text-primary'>{item.price}</span>
												</div>
											))}
										</div>

										{/* Total */}
										<div className='mt-4 pt-4 border-t border-slate-200 flex justify-between items-center'>
											<span className='text-sm font-semibold text-slate-600'>Total</span>
											<span className='text-2xl font-bold text-primary'>$14.97</span>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section - Colorful */}
			<section className='w-full py-16 bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/30 border-y border-slate-200'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
						{[
							{ stat: '99%', label: 'OCR Accuracy', icon: ViewIcon, color: 'bg-blue-100 text-blue-600' },
							{ stat: '10', label: 'Groups per User', icon: Layers01Icon, color: 'bg-purple-100 text-purple-600' },
							{ stat: '250', label: 'Items per List', icon: ShoppingCart01Icon, color: 'bg-pink-100 text-pink-600' },
							{
								stat: '4.9★',
								label: 'User Rating',
								icon: CheckmarkCircle02Icon,
								color: 'bg-emerald-100 text-emerald-600',
							},
						].map((item, i) => (
							<div
								key={i}
								className='text-center'
							>
								<div
									className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-110`}
								>
									<HugeiconsIcon
										icon={item.icon}
										className='w-7 h-7'
									/>
								</div>
								<div className='text-3xl font-bold text-slate-900 mb-1'>{item.stat}</div>
								<p className='text-slate-600 text-sm font-medium'>{item.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='w-full py-20 bg-white'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>All you need to prepare for shopping</h2>
						<p className='text-lg text-slate-600 max-w-2xl mx-auto'>
							From photo to fully extracted, categorized shopping list.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{[
							{
								step: '1',
								icon: Camera01Icon,
								title: 'Snap Receipt',
								description: 'Take a photo with your phone. Works with any store, any format.',
								gradient: 'from-blue-500 to-cyan-500',
								bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
							},
							{
								step: '2',
								icon: ArtificialIntelligence02Icon,
								title: 'AI Extracts',
								description: 'Instant recognition of items, prices, quantities. 99% accuracy guaranteed.',
								gradient: 'from-purple-500 to-pink-500',
								bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
							},
							{
								step: '3',
								icon: ShoppingCart01Icon,
								title: 'Shop Smart',
								description: 'Check items off, sync to base lists, track spending in real-time.',
								gradient: 'from-emerald-500 to-teal-500',
								bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
							},
						].map((item, index) => (
							<Card
								key={index}
								className={`border-2 border-transparent hover:border-slate-200 transition-all p-6 ${item.bg} hover:shadow-lg group`}
							>
								<div className='space-y-5'>
									<div className='flex items-center justify-between'>
										<div
											className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
										>
											<HugeiconsIcon
												icon={item.icon}
												className='w-7 h-7'
											/>
										</div>
										<div
											className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center font-bold text-lg`}
										>
											{item.step}
										</div>
									</div>
									<div>
										<h3 className='text-xl font-bold text-slate-900 mb-2'>{item.title}</h3>
										<p className='text-slate-600 leading-relaxed'>{item.description}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Features Section - Colorful */}
			<section className='w-full py-20 bg-gradient-to-b from-white via-purple-50/20 to-white'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>Everything you need to shop smarter</h2>
						<p className='text-lg text-slate-600 max-w-2xl mx-auto'>
							Complete suite of tools built for modern grocery shoppers.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
						{[
							{
								icon: Layers01Icon,
								title: '10 Groups, Unlimited Lists',
								description: 'Organize by store, meal plan, or season. Create base lists with up to 250 items each.',
							},
							{
								icon: ArtificialIntelligence02Icon,
								title: 'AI That Actually Works',
								description: 'OpenAI Vision API recognizes items, prices, and quantities with 99% accuracy.',
							},
							{
								icon: ShoppingCart01Icon,
								title: 'Real-Time Shopping',
								description: 'Create sessions from base lists. Check items, edit quantities, track totals live.',
							},
							{
								icon: AnalyticsUpIcon,
								title: 'Spending Analytics',
								description: 'Track every purchase, visualize patterns, and make smarter shopping decisions.',
							},
						].map((feature, index) => (
							<Card
								key={index}
								className='border border-slate-200 hover:border-primary/30 transition-all hover:shadow-lg p-6 bg-white group'
							>
								<div className='space-y-4'>
									<div className='w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110'>
										<HugeiconsIcon
											icon={feature.icon}
											className='w-7 h-7 text-primary'
										/>
									</div>
									<div>
										<h3 className='text-xl font-bold text-slate-900 mb-2'>{feature.title}</h3>
										<p className='text-slate-600 leading-relaxed'>{feature.description}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className='w-full py-20 px-4 sm:px-6 lg:px-8 bg-white'>
				<div className='max-w-4xl mx-auto text-center'>
					<h2 className='text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>Ready to transform your shopping?</h2>
					<p className='text-xl text-slate-600 mb-8'>
						Join hundreds of smart shoppers saving time and money every week.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
						<Button className='bg-primary hover:bg-primary/90 text-white h-14 px-10 text-lg font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-primary/25'>
							<Link
								href='/auth/signup'
								className='flex items-center gap-2 w-full justify-center'
							>
								Get Started Free
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className='w-5 h-5'
								/>
							</Link>
						</Button>
						<Button
							variant='outline'
							className='h-14 px-10 text-lg font-semibold border-2 border-slate-300 hover:bg-slate-50 rounded-lg transition-colors'
						>
							<Link href='#demo'>Watch Demo</Link>
						</Button>
					</div>

					<div className='flex items-center justify-center gap-6 flex-wrap text-slate-600 text-sm'>
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
							<span>All features included</span>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='w-full bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-6xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
						<div>
							<div className='flex items-center gap-2 font-bold text-lg mb-3'>
								<div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
									<HugeiconsIcon
										icon={Invoice01Icon}
										className='w-5 h-5 text-white'
									/>
								</div>
								<span>Listys</span>
							</div>
							<p className='text-slate-400 text-sm leading-relaxed'>Transform receipts into smart shopping lists.</p>
						</div>
						<div>
							<h4 className='font-semibold mb-3 text-white'>Product</h4>
							<ul className='space-y-2 text-sm text-slate-400'>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Features
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Pricing
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										FAQ
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-3 text-white'>Company</h4>
							<ul className='space-y-2 text-sm text-slate-400'>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										About
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Contact
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-3 text-white'>Legal</h4>
							<ul className='space-y-2 text-sm text-slate-400'>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400'>
						<p>© 2026 Listys. All rights reserved.</p>
						<div className='flex gap-6'>
							<Link
								href='#'
								className='hover:text-white transition'
							>
								Twitter
							</Link>
							<Link
								href='#'
								className='hover:text-white transition'
							>
								GitHub
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
