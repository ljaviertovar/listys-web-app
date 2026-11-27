import Link from 'next/link'

import { Perforation } from '@/components/commons/perforation'
import { Brand, Shell } from './landing-page'

import { MARKETING_SECTION_LINKS } from '@/data/constants'

const SOCIAL: { label: string; href: string }[] = []

const LINK =
	'focus-ring flex min-h-11 items-center rounded-lg px-2.5 font-mono text-[11.5px] tracking-[0.1em] uppercase transition-colors hover:text-white md:text-[12.5px] md:tracking-[0.08em]'

/** The dark foot of the receipt: brand, the section links, social links and the printed sign-off. */
export default function Footer() {
	return (
		<footer
			data-testid='marketing-footer'
			className='bg-night pt-3 pb-10 text-night-muted md:pb-[34px]'
		>
			<Shell testId='marketing-footer-perforation'>
				<Perforation tone='night' />
			</Shell>
			<Shell
				testId='marketing-footer-shell'
				className='flex flex-wrap items-center gap-x-[26px] gap-y-3.5 pt-6'
			>
				<Brand tone='on-dark' />
				<nav
					aria-label='Footer'
					className='grid w-full grid-cols-2 text-night-text md:flex md:w-auto md:flex-wrap md:gap-0.5 md:text-night-muted'
				>
					{MARKETING_SECTION_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className={LINK}
						>
							{link.label}
						</Link>
					))}
				</nav>
				<span className='flex md:ml-auto'>
					{SOCIAL.map(link => (
						<Link
							key={link.href}
							href={link.href}
							target='_blank'
							rel='noopener noreferrer'
							className={LINK}
						>
							{link.label}
						</Link>
					))}
				</span>
				<p className='flex basis-full flex-wrap justify-between gap-3 border-t border-dashed border-night-line pt-3.5 font-mono text-xs leading-[1.7] tracking-[0.06em]'>
					<span>© {new Date().getFullYear()} Listys</span>
					<span>Turn a receipt into a list your household will actually reuse.</span>
				</p>
				<p className='flex basis-full flex-wrap justify-center gap-3 border-t border-dashed border-night-line pt-3.5 font-mono text-xs leading-[1.7] tracking-[0.06em]'>
					<span className='flex min-h-11 items-center'>
						Build by{' '}
						<a
							href='https://www.ljaviertovar.dev/'
							target='_blank'
							rel='noopener noreferrer'
							className='focus-ring inline-flex min-h-11 items-center underline underline-offset-4 transition-colors hover:text-white'
						>
							ljaviertovar.dev
						</a>
					</span>
				</p>
			</Shell>
		</footer>
	)
}
