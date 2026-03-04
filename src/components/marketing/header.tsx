'use client'

import AuthButtons from '../features/auth/auth-buttons'
import Navbar from './navbar'
import Logo from '../commons/logo'

import { useScrollPosition } from '@/hooks/use-scroll-position'

export default function Header() {
	const scrollPosition = useScrollPosition()

	return (
		<header
			className={`hidden lg:block sticky top-0 z-50 transition-shadow w-full
  ${
		scrollPosition > 56
			? 'bg-background/40 shadow bg-opacity-60 backdrop-blur-lg backdrop-filter border-b'
			: 'bg-transparent shadow-none'
	}
  `}
		>
			<div className='hidden container mx-auto max-w-7xl lg:flex h-14 items-center gap-6 px-8'>
				<div className='flex items-center gap-4 shrink-0'>
					<Logo />
				</div>

				<Navbar />

				<div className='shrink-0'>
					<AuthButtons />
				</div>
			</div>
		</header>
	)
}
