'use client'

import AuthButtons from '@/components/features/auth/auth-buttons'
import { useScrollPosition } from '@/hooks/use-scroll-position'
import { cn } from '@/lib/utils'
import MobileMenu from './mobile-menu'

export const Header = () => {
	const scrollPosition = useScrollPosition()

	return (
		<header
			className={cn(
				'sticky top-0 z-50 flex h-16 items-center gap-3 px-3 sm:px-4 border-b bg-card/40 backdrop-blur-lg backdrop-filter transition-colors duration-200',
				scrollPosition > 20 ? 'bg-card/60' : 'bg-card/40',
			)}
		>
			<div className='flex items-center gap-2'>
				<MobileMenu />
			</div>

			<div className='flex-1' />

			<div className='flex items-center'>
				<AuthButtons />
			</div>
		</header>
	)
}

Header.displayName = 'Header'
