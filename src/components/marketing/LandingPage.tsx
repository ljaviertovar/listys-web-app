'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	ArrowRight,
	Receipt,
	Zap,
	ShoppingCart,
	CheckCircle2,
	ImageIcon,
	BarChart3,
	Layers,
	ListTodo,
	Eye,
} from 'lucide-react'

const ProductShowcase = () => {
	const products = [
		{ emoji: '🥬', name: 'Romaine Lettuce', category: 'Produce', price: '$2.49', qty: '1 head' },
		{ emoji: '🥕', name: 'Carrots', category: 'Produce', price: '$1.99', qty: '2 lbs' },
		{ emoji: '🍗', name: 'Chicken Breast', category: 'Meat', price: '$8.99', qty: '2 lbs' },
		{ emoji: '🥛', name: 'Whole Milk', category: 'Dairy', price: '$3.49', qty: '1 gallon' },
		{ emoji: '🧈', name: 'Butter', category: 'Dairy', price: '$5.29', qty: '1 lb' },
		{ emoji: '🍞', name: 'Whole Wheat Bread', category: 'Bakery', price: '$3.99', qty: '1 loaf' },
	]

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{products.map((item, i) => (
				<div
					key={i}
					className='flex items-center justify-between p-4 bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow'
				>
					<div className='flex items-center gap-3'>
						<span className='text-3xl'>{item.emoji}</span>
						<div>
							<p className='font-semibold text-foreground text-sm'>{item.name}</p>
							<p className='text-xs text-muted-foreground'>{item.qty}</p>
						</div>
					</div>
					<div className='text-right'>
						<p className='font-bold text-primary'>{item.price}</p>
						<p className='text-xs text-muted-foreground'>{item.category}</p>
					</div>
				</div>
			))}
		</div>
	)
}

export default function LandingPage() {
	return (
		<div className='w-full'>
			{/* Navigation */}
			<nav className='sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
					<Link
						href='/'
						className='flex items-center gap-2 font-bold text-xl'
					>
						<div className='w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center'>
							<Receipt className='w-5 h-5 text-white' />
						</div>
						<span className='text-foreground'>Listys</span>
					</Link>
					<div className='flex items-center gap-4'>
						<Button
							variant='ghost'
							asChild
						>
							<Link href='/auth/signin'>Sign In</Link>
						</Button>
						<Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
							<Link
								href='/auth/signup'
								className='flex items-center gap-2'
							>
								Get Started
							</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className='w-full pt-20 pb-24 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-7xl mx-auto'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
						{/* Left Content */}
						<div className='space-y-8'>
							<div className='space-y-6'>
								<div className='inline-block'>
									<span className='px-4 py-2 bg-secondary text-primary font-medium rounded-full text-sm'>
										✨ AI-Powered Receipt OCR
									</span>
								</div>
								<h1 className='text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance'>
									Transform receipts into organized shopping lists
								</h1>
								<p className='text-xl text-muted-foreground leading-relaxed max-w-md text-pretty'>
									Stop wasting receipts and time planning. Listys uses AI-powered OCR to extract items from receipts,
									sync with reusable base lists, and give you an effortless shopping experience with full spending
									insights.
								</p>
							</div>

							<div className='flex flex-col sm:flex-row gap-4'>
								<Button className='bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg group'>
									<Link
										href='/auth/signup'
										className='flex items-center gap-2'
									>
										Get Started — It's Free
										<ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
									</Link>
								</Button>
								<Button
									variant='outline'
									className='h-12 px-8 text-lg border-2'
								>
									<Link href='#demo'>See Demo</Link>
								</Button>
							</div>

							<div className='flex flex-col sm:flex-row gap-6 pt-4'>
								<div className='flex items-center gap-2'>
									<CheckCircle2 className='w-5 h-5 text-primary flex-shrink-0' />
									<span className='text-sm text-foreground font-medium'>No credit card required</span>
								</div>
								<div className='flex items-center gap-2'>
									<CheckCircle2 className='w-5 h-5 text-primary flex-shrink-0' />
									<span className='text-sm text-foreground font-medium'>Cancel anytime</span>
								</div>
							</div>
						</div>

						{/* Right Image Card */}
						<div className='relative'>
							<div className='absolute -top-8 -right-8 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl'></div>
							<Card className='relative z-10 border-2 border-primary/20 bg-gradient-to-br from-white to-secondary/50 p-8 shadow-xl'>
								<div className='space-y-6'>
									<div className='bg-white rounded-xl p-6 border border-border shadow-md'>
										<div className='flex items-start justify-between mb-4'>
											<div>
												<p className='text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1'>
													<Receipt className='w-4 h-4' /> Auto-extracted from receipt
												</p>
												<h3 className='text-lg font-bold text-foreground mt-1'>Weekly Shopping</h3>
											</div>
											<span className='text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full'>
												6 items • $32.53
											</span>
										</div>
										<div className='space-y-3'>
											<div className='flex items-center justify-between p-3 bg-secondary/50 rounded-lg'>
												<div className='flex items-center gap-3'>
													<span className='text-2xl'>🥬</span>
													<div>
														<p className='font-medium text-foreground text-sm'>Romaine Lettuce</p>
														<p className='text-xs text-muted-foreground'>Produce</p>
													</div>
												</div>
												<div className='text-right'>
													<p className='font-semibold text-foreground text-sm'>$2.49</p>
													<input
														type='checkbox'
														className='mt-1'
													/>
												</div>
											</div>
											<div className='flex items-center justify-between p-3 bg-secondary/50 rounded-lg'>
												<div className='flex items-center gap-3'>
													<span className='text-2xl'>🍗</span>
													<div>
														<p className='font-medium text-foreground text-sm'>Chicken Breast</p>
														<p className='text-xs text-muted-foreground'>Meat • 2 lbs</p>
													</div>
												</div>
												<div className='text-right'>
													<p className='font-semibold text-foreground text-sm'>$8.99</p>
													<input
														type='checkbox'
														className='mt-1'
													/>
												</div>
											</div>
											<div className='flex items-center justify-between p-3 bg-secondary/50 rounded-lg'>
												<div className='flex items-center gap-3'>
													<span className='text-2xl'>🥛</span>
													<div>
														<p className='font-medium text-foreground text-sm'>Whole Milk</p>
														<p className='text-xs text-muted-foreground'>Dairy • 1 gallon</p>
													</div>
												</div>
												<div className='text-right'>
													<p className='font-semibold text-foreground text-sm'>$3.49</p>
													<input
														type='checkbox'
														className='mt-1'
													/>
												</div>
											</div>
										</div>
										<div className='mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20'>
											<p className='text-xs text-primary font-medium'>
												💡 Tip: Sync these items to your base lists and reuse them next time!
											</p>
										</div>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Problems We Solve Section */}
			<section className='w-full py-24 px-4 sm:px-6 lg:px-8 bg-secondary/40'>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance'>
							The Shopping Challenges We Solve
						</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							Listys tackles the pain points that waste your time and money
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						{[
							{
								problem: '❌ Lost Receipts',
								solution: 'Upload receipts digitally',
								icon: Receipt,
								color: 'from-red-50 to-red-100/50',
							},
							{
								problem: '❌ Repetitive Planning',
								solution: 'Reusable base lists',
								icon: ListTodo,
								color: 'from-orange-50 to-orange-100/50',
							},
							{
								problem: '❌ Budget Overruns',
								solution: 'Track spending in real-time',
								icon: BarChart3,
								color: 'from-blue-50 to-blue-100/50',
							},
							{
								problem: '❌ Disorganized Shopping',
								solution: 'AI-categorized items',
								icon: Layers,
								color: 'from-green-50 to-green-100/50',
							},
						].map((item, index) => (
							<Card
								key={index}
								className={`bg-gradient-to-br ${item.color} border-2 border-primary/10 p-8 hover:shadow-lg transition-all`}
							>
								<div className='flex items-start gap-6'>
									<div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm'>
										<item.icon className='w-6 h-6 text-primary' />
									</div>
									<div>
										<h3 className='text-xl font-bold text-foreground mb-2'>{item.problem}</h3>
										<p className='text-muted-foreground'>{item.solution}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='w-full py-24 px-4 sm:px-6 lg:px-8 bg-white'>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance'>Three Simple Steps</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							From receipt to organized shopping in seconds
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{[
							{
								step: '01',
								icon: ImageIcon,
								title: 'Snap & Upload',
								description: 'Take a photo of your receipt or upload an image. Works with receipts from any store.',
							},
							{
								step: '02',
								icon: Zap,
								title: 'AI Extracts',
								description: 'Our AI instantly recognizes items, quantities, prices, and categories with 99% accuracy.',
							},
							{
								step: '03',
								icon: ShoppingCart,
								title: 'Shop Smart',
								description:
									'Check items off, manage multiple lists, track spending, and sync back to reusable base lists.',
							},
						].map((item, index) => (
							<div
								key={index}
								className='relative'
							>
								<Card className='border-2 border-primary/10 hover:border-primary/30 transition-colors p-8 h-full group'>
									<div className='flex flex-col h-full'>
										<div className='text-5xl font-bold text-primary/20 mb-4'>{item.step}</div>
										<div className='w-16 h-16 mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors'>
											<item.icon className='w-8 h-8 text-primary' />
										</div>
										<h3 className='text-xl font-bold text-foreground mb-3'>{item.title}</h3>
										<p className='text-muted-foreground leading-relaxed flex-grow'>{item.description}</p>
									</div>
								</Card>
								{index < 2 && (
									<div className='hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent'></div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='w-full py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20'>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance'>
							Powerful Features for Smart Shopping
						</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							Everything you need to organize, track, and optimize your grocery shopping
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
						{[
							{
								icon: Layers,
								title: 'Group & List Organization',
								description:
									'Create up to 10 shopping groups (Weekly Groceries, Costco Trips, Meal Prep). Build base lists with up to 200 items and reuse them endlessly.',
								features: ['Store-based lists', 'Category-based lists', 'Meal plan lists'],
							},
							{
								icon: Zap,
								title: 'AI Receipt Processing',
								description:
									'Upload JPEG, PNG, or HEIC receipt images. Our OpenAI Vision API extracts items, quantities, and prices with 99% accuracy.',
								features: ['Multiple formats', 'Manual review & edit', 'Instant extraction'],
							},
							{
								icon: ShoppingCart,
								title: 'Active Shopping Sessions',
								description:
									'Create shopping sessions from base lists. Check items off as you shop in real-time, add/remove on the fly, and track totals.',
								features: ['Real-time checking', 'Live totals', 'Quantity updates'],
							},
							{
								icon: BarChart3,
								title: 'Shopping History & Analytics',
								description:
									'View all completed shopping sessions by group. Track spending over time and identify patterns to make smarter purchasing decisions.',
								features: ['Spending trends', 'Date tracking', 'Category breakdown'],
							},
						].map((feature, index) => (
							<Card
								key={index}
								className='border-2 border-primary/10 p-8 hover:shadow-lg transition-shadow group'
							>
								<div className='w-12 h-12 mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors'>
									<feature.icon className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-bold text-foreground mb-2'>{feature.title}</h3>
								<p className='text-muted-foreground leading-relaxed mb-4'>{feature.description}</p>
								<div className='flex flex-wrap gap-2'>
									{feature.features.map((f, i) => (
										<span
											key={i}
											className='text-xs bg-primary/10 text-primary px-3 py-1 rounded-full'
										>
											{f}
										</span>
									))}
								</div>
							</Card>
						))}
					</div>

					<div className='bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-2xl p-8 border-2 border-primary/20'>
						<h3 className='text-2xl font-bold text-foreground mb-6 text-center'>Real Shopping Items Example</h3>
						<ProductShowcase />
					</div>
				</div>
			</section>

			{/* Trust Section */}
			<section className='w-full py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-border'>
				<div className='max-w-7xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
						{[
							{ stat: '99%', label: 'OCR Accuracy', icon: Eye },
							{ stat: '10', label: 'Groups per User', icon: Layers },
							{ stat: '250', label: 'Items per Sync', icon: ShoppingCart },
							{ stat: '4.8★', label: 'Loved by Shoppers', icon: CheckCircle2 },
						].map((item, i) => (
							<div
								key={i}
								className='space-y-3'
							>
								<item.icon className='w-8 h-8 text-primary mx-auto' />
								<div className='text-3xl lg:text-4xl font-bold text-foreground'>{item.stat}</div>
								<p className='text-muted-foreground'>{item.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className='w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-accent/5'>
				<div className='max-w-3xl mx-auto text-center'>
					<h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance'>
						Transform Your Shopping Today
					</h2>
					<p className='text-xl text-muted-foreground mb-8 leading-relaxed'>
						Stop losing receipts. Stop wasting time planning. Start shopping smarter with AI-powered list management.
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
						<Button className='bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg group'>
							<Link
								href='/auth/signup'
								className='flex items-center gap-2'
							>
								Get Started — It's Free
								<ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
							</Link>
						</Button>
						<Button
							variant='outline'
							className='h-14 px-10 text-lg border-2'
						>
							<Link href='#demo'>Watch Demo</Link>
						</Button>
					</div>
					<p className='text-sm text-muted-foreground'>
						<CheckCircle2 className='w-4 h-4 inline mr-2 text-primary' />
						No credit card required • Cancel anytime • Full access to all features
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className='w-full bg-foreground text-white py-16 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-7xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
						<div>
							<div className='flex items-center gap-2 font-bold text-lg mb-4'>
								<div className='w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center'>
									<Receipt className='w-5 h-5 text-white' />
								</div>
								<span>Listys</span>
							</div>
							<p className='text-white/70 text-sm leading-relaxed'>
								Transform receipts into smart shopping lists. Save time, reduce waste, shop smarter.
							</p>
						</div>
						<div>
							<h4 className='font-semibold mb-4 text-white'>Product</h4>
							<ul className='space-y-3 text-sm text-white/70'>
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
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Updates
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-4 text-white'>Company</h4>
							<ul className='space-y-3 text-sm text-white/70'>
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
										Blog
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
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Support
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-4 text-white'>Legal</h4>
							<ul className='space-y-3 text-sm text-white/70'>
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
								<li>
									<Link
										href='#'
										className='hover:text-white transition'
									>
										Cookie Policy
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4'>
						<p className='text-sm text-white/60'>© 2026 Listys. All rights reserved.</p>
						<div className='flex gap-6'>
							<Link
								href='#'
								className='text-white/60 hover:text-white transition text-sm'
							>
								Twitter
							</Link>
							<Link
								href='#'
								className='text-white/60 hover:text-white transition text-sm'
							>
								GitHub
							</Link>
							<Link
								href='#'
								className='text-white/60 hover:text-white transition text-sm'
							>
								LinkedIn
							</Link>
							<Link
								href='#'
								className='text-white/60 hover:text-white transition text-sm'
							>
								Instagram
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
