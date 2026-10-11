'use client'

import { AuthButtons } from '@/components/features/auth'
import { InstallAppButton } from '@/components/features/pwa'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useScrollPosition } from '@/hooks'
import Logo from '@/components/commons/logo'
import { cn } from '@/utils'
import { AppBreadcrumb } from './app-breadcrumb'

/**
 * Phones: the logo and the account button (60px, design A1 mobile), with navigation in the bottom tab bar.
 * From `lg` (design A1 desktop): a 64px bar on the page ground with the sidebar trigger, a hairline and the breadcrumb on
 * the left, and install + account on the right.
 */
export const Header = () => {
	const scrollPosition = useScrollPosition()

	return (
		<header
			className={cn(
				'sticky top-0 z-50 flex h-15 items-center justify-between gap-2 border-b bg-card/88 pr-2 pl-4 backdrop-blur-lg backdrop-filter transition-colors duration-200 lg:h-16 lg:justify-start lg:gap-3 lg:border-b-0 lg:bg-[#F2F4F7] lg:pr-6 lg:pl-3 lg:backdrop-blur-none lg:dark:bg-sidebar',
				scrollPosition > 20 && 'shadow-sm lg:shadow-none',
			)}
		>
			<div
				data-testid='header-logo'
				className='lg:hidden'
			>
				<Logo wordmarkClassName='font-display text-[19px] leading-none font-bold tracking-[-0.02em]' />
			</div>

			<div className='hidden items-center gap-2 lg:flex'>
				<SidebarTrigger className='size-9 rounded-[8px] text-foreground hover:bg-[#E9ECF0] hover:text-foreground dark:hover:bg-muted' />
				<span
					aria-hidden='true'
					className='mr-1.5 ml-0.5 h-4 w-px bg-slate-300 dark:bg-border'
				/>
				<AppBreadcrumb />
			</div>

			<div className='flex items-center lg:ml-auto'>
				<div className='hidden items-center md:flex'>
					<InstallAppButton />
				</div>
				<AuthButtons />
			</div>
		</header>
	)
}

Header.displayName = 'Header'
