'use client'

import { AuthButtons } from '@/components/features/auth'
import { InstallAppButton } from '@/components/features/pwa'
import { useScrollPosition } from '@/hooks'
import Logo from '@/components/commons/logo'
import { cn } from '@/utils'
import MobileNavDrawer from './mobile-nav-drawer'

export const Header = () => {
	const scrollPosition = useScrollPosition()

	return (
		<header
			className={cn(
				'sticky top-0 z-50 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 sm:px-4 lg:flex lg:gap-3 border-b bg-card/88 backdrop-blur-lg backdrop-filter transition-colors duration-200',
				scrollPosition > 20 && 'shadow-sm',
			)}
		>
			<div className='flex items-center justify-self-start lg:hidden'>
				<MobileNavDrawer />
			</div>

			<div
				data-testid='header-logo'
				className='flex justify-center lg:hidden'
			>
				<Logo />
			</div>

			<div className='flex items-center justify-self-end lg:ml-auto'>
				<div className='hidden md:block'>
					<InstallAppButton />
				</div>
				<AuthButtons />
			</div>
		</header>
	)
}

Header.displayName = 'Header'
