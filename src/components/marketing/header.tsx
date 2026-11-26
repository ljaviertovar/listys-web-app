'use client'

import Link from 'next/link'

import { AuthButtons } from '@/components/features/auth'
// The commons barrel, not the landing barrel: this client header must not pull every section into the client bundle.
import { Brand, ButtonLink, Shell } from './landing-page/commons'

import { MARKETING_SECTION_LINKS } from '@/data/constants'
import { useScrollPosition } from '@/hooks'
import { cn } from '@/utils'

/** The paper header: brand, the section links in the receipt's mono voice, then sign in and the call to action. Solid once scrolled. */
export default function Header() {
	const scrollPosition = useScrollPosition()
	const scrolled = scrollPosition > 18

	return (
		<header
			data-testid='marketing-header'
			className={cn(
				'sticky top-0 z-[60] border-b border-transparent transition-[background-color,border-color] duration-200',
				scrolled && 'border-paper-line bg-paper/92 backdrop-blur-md',
			)}
		>
			<Shell className='flex h-14 items-center gap-2.5 md:h-[68px] md:gap-[22px]'>
				<Brand />
				<nav
					aria-label='Sections'
					className='hidden gap-0.5 min-[61.25rem]:flex'
				>
					{MARKETING_SECTION_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className='focus-ring flex min-h-11 items-center rounded-lg px-2.5 font-mono text-[12.5px] tracking-[0.08em] text-paper-text uppercase transition-colors hover:text-primary'
						>
							{link.label}
						</Link>
					))}
				</nav>
				<span className='flex-1' />
				<AuthButtons
					signedOut={
						<div className='flex items-center gap-1 md:gap-3'>
							<Link
								href='/auth/signin'
								data-testid='marketing-header-sign-in'
								className='focus-ring flex min-h-11 items-center rounded-md px-2.5 text-[15px] font-semibold text-paper-ink hover:text-primary'
							>
								Sign in
							</Link>
							<ButtonLink
								href='/auth/signup'
								size='xl'
								testId='marketing-header-sign-up'
							>
								<span className='md:hidden'>Create account</span>
								<span className='hidden md:inline'>Create free account</span>
							</ButtonLink>
						</div>
					}
				/>
			</Shell>
		</header>
	)
}
