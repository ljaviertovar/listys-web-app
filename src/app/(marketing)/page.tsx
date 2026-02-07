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
import { Footer } from '@/components/marketing/footer'
import { Faq } from '@/components/marketing/faq'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing. Transform photos into organized lists instantly.',
	keywords: ['shopping list', 'grocery app', 'AI receipt scanner', 'meal planning', 'expense tracker', 'smart shopping'],
	authors: [{ name: 'Listys Team' }],
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://listys.app',
		title: 'Listys - Smart Shopping List Manager',
		description: 'Transform receipts into organized shopping lists with AI. Save time and track spending.',
		siteName: 'Listys',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Listys App Preview',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Listys - Smart Shopping List Manager',
		description: 'Transform receipts into organized shopping lists with AI.',
		images: ['/og-image.jpg'],
		creator: '@listysapp',
	},
	metadataBase: new URL('https://listys.app'),
}

export default async function Page() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (user) redirect('/dashboard')

	return (
		<div className='w-full overflow-hidden bg-white'>
			{/* Hero Section - Hybrid: Layout A + Copy B + Colors B */}
			<section className='relative w-full pt-20 pb-24 lg:pt-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-white to-white overflow-hidden'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='flex flex-col md:flex-row items-center gap-12 lg:gap-20'>
						
						{/* Left Content (Text) - Layout A style */}
						<div className='flex-1 text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards'>
							{/* Badge */}
							<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide w-fit mx-auto md:mx-0'>
								<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
								<span>AI-Powered Receipt Scanning</span>
							</div>

							<h1 className='text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight'>
								Turn Receipts into <br />
								<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 relative'>
									Smart Shopping Lists
								</span>
							</h1>

							<p className='text-xl text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0'>
								Stop manually typing items. Just snap a photo of any receipt, and Listys instantly organizes everything for your next trip.
							</p>

							<div className='flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start'>
								<Button size="lg" className='bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-primary/40 text-lg'>
									<Link href='/auth/signup' className='flex items-center gap-2'>
										Start for Free
										<HugeiconsIcon icon={ArrowRight01Icon} className='w-5 h-5' />
									</Link>
								</Button>
								<Button size="lg" variant='outline' className='h-14 px-8 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-lg'>
									<Link href='#how-it-works'>
										How it Works
									</Link>
								</Button>
							</div>

							<div className="flex items-center gap-6 pt-4 justify-center md:justify-start text-sm font-medium text-slate-500">
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-emerald-500" />
									<span>No credit card needed</span>
								</div>
								<div className="flex items-center gap-2">
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-emerald-500" />
									<span>99% Accuracy</span>
								</div>
							</div>
						</div>

						{/* Right Content (Visual) - Layout A style + Blob Animation */}
						<div className='flex-1 relative w-full max-w-lg lg:max-w-xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 fill-mode-forwards'>
							{/* Animated Blobs (Restored) */}
							<div className='absolute -top-20 -right-20 w-72 h-72 bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob'></div>
							<div className='absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000'></div>
							<div className='absolute top-20 left-20 w-72 h-72 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000'></div>

							<div className='relative transform hover:scale-[1.02] transition-transform duration-500'>
								{/* Glassmorphism Card */}
								<Card className='relative border border-slate-200/60 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl shadow-slate-200/50'>
									<div className='space-y-6'>
										<div className='flex items-start justify-between border-b border-slate-100 pb-4'>
											<div>
												<p className='text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1'>
													<HugeiconsIcon icon={Invoice01Icon} className='w-3.5 h-3.5' />
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
												{ emoji: '🍗', name: 'Boneless Chicken Breast', price: '$12.45', qty: '1.5 lb' },
												{ emoji: '🥛', name: 'Whole Milk - Gallon', price: '$5.29', qty: '1' },
											].map((item, i) => (
												<div
													key={i}
													className='group flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all duration-300'
												>
													<div className='flex items-center gap-4'>
														<span className='text-2xl bg-slate-50 w-10 h-10 flex items-center justify-center rounded-full'>{item.emoji}</span>
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
											<HugeiconsIcon icon={CheckmarkCircle02Icon} className='w-5 h-5 text-emerald-600' />
										</div>
										<div>
											<p className='text-xs text-slate-500 font-medium uppercase'>Scan Success</p>
											<p className='text-lg font-bold text-slate-900'>100% Match</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section - Hybrid: Layout A (Boxed) + Colors A (Rainbow) */}
			<section className='w-full py-16 bg-white border-y border-slate-100'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
						{[
							{ stat: '99%', label: 'OCR Accuracy', icon: ViewIcon, color: 'bg-emerald-100 text-emerald-600' },
							{ stat: '10', label: 'Groups per User', icon: Layers01Icon, color: 'bg-rose-100 text-rose-600' },
							{ stat: '250', label: 'Items per List', icon: ShoppingCart01Icon, color: 'bg-sky-100 text-sky-600' },
							{ stat: '4.9★', label: 'User Rating', icon: CheckmarkCircle02Icon, color: 'bg-amber-100 text-amber-600' },
						].map((item, i) => (
							<div key={i} className='text-center group'>
								<div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
									<HugeiconsIcon icon={item.icon} className='w-7 h-7' />
								</div>
								<div className='text-3xl font-bold text-slate-900 mb-1'>{item.stat}</div>
								<p className='text-slate-500 text-sm font-medium'>{item.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works - Hybrid: Cards A + Gradient B */}
			<section id='how-it-works' className='w-full py-24 bg-slate-50/50'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-20 max-w-3xl mx-auto'>
						<h2 className='text-primary font-semibold tracking-wide uppercase text-sm mb-3'>How it Works</h2>
						<h3 className='text-3xl md:text-5xl font-bold text-slate-900 mb-6'>From Receipt to List in Seconds</h3>
						<p className='text-lg text-slate-600'>
							Our AI handles the boring part. You just snap a picture and get ready to shop.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{[
							{
								step: '01',
								icon: Camera01Icon,
								title: 'Snap a Photo',
								desc: 'Take a picture of your paper receipt, or upload a digital one directly.',
								gradient: 'from-blue-500 to-indigo-500', // Brand B gradient
							},
							{
								step: '02',
								icon: ArtificialIntelligence02Icon,
								title: 'AI Analysis',
								desc: 'We identify every item, price, and quantity with high precision.',
								gradient: 'from-indigo-500 to-purple-500', // Brand B gradient
							},
							{
								step: '03',
								icon: ShoppingCart01Icon,
								title: 'Shop Smart',
								desc: 'Items are categorized automatically. Check them off as you shop.',
								gradient: 'from-purple-500 to-pink-500', // Subtle variation but still analogous
							},
						].map((item, index) => (
							<Card key={index} className='relative border border-slate-200 hover:border-slate-300 transition-all duration-300 p-8 bg-white hover:shadow-xl hover:-translate-y-1 group overflow-hidden'>
								{/* Gradient Line Top (Layout A Feature) */}
								<div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient}`}></div>
								
								<div className='space-y-6 relative z-10'>
									<div className='flex items-center justify-between'>
										<div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
											<HugeiconsIcon icon={item.icon} className='w-8 h-8' />
										</div>
										<span className='text-6xl font-black text-slate-100 select-none absolute -right-4 -top-4 opacity-50 group-hover:opacity-80 transition-opacity'>
											{item.step}
										</span>
									</div>
									<div>
										<h3 className='text-xl font-bold text-slate-900 mb-3'>{item.title}</h3>
										<p className='text-slate-600 leading-relaxed text-sm'>{item.desc}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Features Grid - Hybrid: Layout A (Cards) + Content B */}
			<section className='w-full py-24 bg-white'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-5xl font-bold text-slate-900 mb-6'>Packed with Power</h2>
						<p className='text-lg text-slate-600 max-w-2xl mx-auto'>
							Everything modern shoppers need to stay organized and save money.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
							<Card key={index} className='border border-slate-200 hover:border-primary/20 transition-all hover:shadow-lg p-8 bg-slate-50 group hover:bg-white'>
								<div className='flex gap-6 items-start'>
									<div className='shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-slate-100'>
										<HugeiconsIcon icon={feature.icon} className='w-7 h-7 text-primary' />
									</div>
									<div>
										<h3 className='text-xl font-bold text-slate-900 mb-3'>{feature.title}</h3>
										<p className='text-slate-600 leading-relaxed'>{feature.description}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			<Faq />

			{/* CTA - Minimal & Strong (Option B styling kept as it was clean) */}
			<section className='w-full py-24 bg-gradient-to-b from-white to-primary/5'>
				<div className='max-w-4xl mx-auto text-center'>
					<h2 className='text-4xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight'>
						Ready to shop smarter?
					</h2>
					<p className='text-xl text-slate-600 mb-10'>
						Join thousands of users saving time with Listys.
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button size="lg" className='bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-xl text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1'>
							<Link href='/auth/signup' className='flex items-center gap-2'>
								Get Started Now
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	)
}

