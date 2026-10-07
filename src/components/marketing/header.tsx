'use client'

import Link from 'next/link'

import { AuthButtons } from '@/components/features/auth'
import { Brand, ButtonLink, Shell } from './landing-page'

import { MARKETING_SECTION_LINKS } from '@/data/constants'
import { useScrollPosition } from '@/hooks'
import { cn } from '@/utils'

/** Match the hero surface at the top, then turn solid white on scroll. */
export default function Header() {
	const scrollPosition = useScrollPosition()
	const scrolled = scrollPosition > 18

	return (
		<header
			data-testid='marketing-header'
			className={cn(
				'sticky top-0 z-[60] border-b border-transparent bg-transparent transition-[background-color,border-color] duration-200',
				scrolled && 'border-slate-200 bg-white/70 backdrop-blur-md',
			)}
		>
			<Shell className='relative flex h-16 items-center gap-[26px]'>
				<Brand />
				<nav className='hidden min-[900px]:absolute min-[900px]:left-1/2 min-[900px]:flex min-[900px]:-translate-x-1/2 min-[900px]:gap-6 min-[900px]:text-sm min-[900px]:font-semibold min-[900px]:text-slate-700'>
					{MARKETING_SECTION_LINKS.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className='hover:text-primary'
						>
							{link.label}
						</Link>
					))}
				</nav>
				<span className='flex-1' />
				<AuthButtons
					signedOut={
						<ButtonLink
							size='sm'
							href='/auth/signup'
						>
							Create free account
						</ButtonLink>
					}
				/>
			</Shell>
		</header>
	)
}
