import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon } from '@hugeicons/core-free-icons'

export function Footer() {
	return (
		<footer className='w-full bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
					<div>
						<div className='flex items-center gap-2 font-bold text-lg mb-3 transition-transform hover:scale-105 w-fit cursor-pointer'>
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
					<p>© {new Date().getFullYear()} Listys. All rights reserved.</p>
					<div className='flex gap-6'>
								<Link
									href='#'
									className='hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all hover:after:w-full'
								>
							Twitter
						</Link>
								<Link
									href='#'
									className='hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all hover:after:w-full'
								>
							GitHub
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
