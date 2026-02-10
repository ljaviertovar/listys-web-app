import Link from 'next/link'

import Logo from '../commons/logo'

export function Footer() {
	return (
		<footer className='relative bg-white px-4 py-12 text-foreground sm:px-6 lg:px-8'>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent' />
			<div className='pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-white/60 to-transparent' />
			<div className='relative z-10 mx-auto max-w-6xl'>
				<div className='relative mb-8 grid grid-cols-1 gap-8 md:grid-cols-4'>
					<div className='space-y-2'>
						<Logo />
						<p className='text-muted-foreground text-sm leading-relaxed'>
							Transform receipts into smart shopping lists.
						</p>
					</div>
					<div>
						<h4 className='mb-3 font-semibold text-foreground'>Product</h4>
						<ul className='text-muted-foreground space-y-2 text-sm'>
							<li>
								<Link
									href='#how-it-works'
									className='transition hover:text-foreground'
								>
									How it works
								</Link>
							</li>
							<li>
								<Link
									href='#'
									className='transition hover:text-foreground'
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									href='#faq'
									className='transition hover:text-foreground'
								>
									FAQ
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className='mb-3 font-semibold text-foreground'>Company</h4>
						<ul className='text-muted-foreground space-y-2 text-sm'>
							<li>
								<Link
									href='#'
									className='transition hover:text-foreground'
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href='#'
									className='transition hover:text-foreground'
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className='mb-3 font-semibold text-foreground'>Legal</h4>
						<ul className='text-muted-foreground space-y-2 text-sm'>
							<li>
								<Link
									href='#'
									className='transition hover:text-foreground'
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href='#'
									className='transition hover:text-foreground'
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className='text-muted-foreground border-border/60 relative flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm sm:flex-row'>
					<p>&copy; {new Date().getFullYear()} Listys</p>
					<div className='flex gap-6'>
						<Link
							href='https://x.com'
							className='relative transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full'
						>
							Twitter
						</Link>
						<Link
							href='https://github.com'
							className='relative transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full'
						>
							GitHub
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
