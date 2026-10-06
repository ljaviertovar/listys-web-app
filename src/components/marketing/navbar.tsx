import { MARKETING_SECTION_LINKS } from '@/data/constants'
import Link from 'next/link'

function scrollToSection(href: string) {
	if (typeof window === 'undefined') return

	const hash = href.split('#')[1]
	if (!hash || window.location.pathname !== '/') return

	const target = document.getElementById(hash)
	if (!target) return

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	const headerOffset = 76
	const top = target.getBoundingClientRect().top + window.scrollY - headerOffset

	window.history.replaceState(null, '', `/#${hash}`)
	window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

export default function Navbar() {
	return (
		<nav className='flex flex-1 items-center justify-center'>
			<div className='inline-flex items-center gap-1 p-1'>
				{MARKETING_SECTION_LINKS.map(link => (
					<Link
						key={link.href}
						href={link.href}
						onClick={event => {
							if (!link.href.includes('#')) return
							if (typeof window === 'undefined' || window.location.pathname !== '/') return
							event.preventDefault()
							scrollToSection(link.href)
						}}
						className='rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-white/80 hover:text-slate-900 hover:shadow-[0_10px_20px_-18px_rgba(15,23,42,0.25)]'
					>
						{link.label}
					</Link>
				))}
			</div>
		</nav>
	)
}
