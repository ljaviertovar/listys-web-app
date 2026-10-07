import Link from 'next/link'

import { Brand, Shell } from './landing-page'

const COLUMNS = [
	{
		title: 'Product',
		links: [
			{ label: 'How it works', href: '/#how-it-works' },
			{ label: 'Shared lists', href: '/#shared-lists' },
			{ label: 'FAQ', href: '/#faq' },
		],
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', href: '#' },
			{ label: 'Contact', href: '#' },
		],
	},
	{
		title: 'Legal',
		links: [
			{ label: 'Privacy Policy', href: '#' },
			{ label: 'Terms of Service', href: '#' },
		],
	},
]

/** Marketing footer. */
export default function Footer() {
	return (
		<footer
			data-testid='marketing-footer'
			className='section-divider bg-white pt-12 pb-[34px]'
		>
			<Shell>
				<div className='grid grid-cols-1 gap-8 sm:grid-cols-[2fr_1fr_1fr_1fr]'>
					<div>
						<Brand />
						<p className='mt-3 max-w-[26em] text-[13.5px] leading-[1.6] text-slate-500'>
							Turn a receipt into a list your household will actually reuse.
						</p>
					</div>
					{COLUMNS.map(column => (
						<div key={column.title}>
							<h4 className='mb-3 text-[13.5px] font-bold text-slate-900'>{column.title}</h4>
							<ul>
								{column.links.map(link => (
									<li
										key={link.label}
										className='py-[5px] text-[13.5px] text-slate-500'
									>
										<Link
											href={link.href}
											className='hover:text-primary'
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div className='mt-[38px] flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 text-[13px] text-slate-500'>
					<span>&copy; {new Date().getFullYear()} Listys</span>
					<span className='flex gap-[22px]'>
						<Link
							href='https://x.com/ljaviertovar'
							target='_blank'
							rel='noopener noreferrer'
							className='hover:text-primary'
						>
							X
						</Link>
						<Link
							href='https://github.com/ljaviertovar'
							target='_blank'
							rel='noopener noreferrer'
							className='hover:text-primary'
						>
							GitHub
						</Link>
					</span>
				</div>
			</Shell>
		</footer>
	)
}
