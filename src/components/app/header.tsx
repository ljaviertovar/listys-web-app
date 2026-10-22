'use client'

import { AuthButtons } from '@/components/features/auth'
import { InstallAppButton } from '@/components/features/pwa'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Logo from '@/components/commons/logo'
import { cn } from '@/utils'
import { AppBreadcrumb } from './app-breadcrumb'
import { useHeaderScrollState } from './hooks/use-header-scroll-state'

/**
 * Phones: a 60px logo and account bar that hides on downward scroll and returns on upward scroll; navigation stays in
 * the bottom tab bar. From `lg` (design A1 desktop): a 64px bar on the page ground with sidebar trigger and breadcrumb
 * on the left, and install + account on the right.
 */
export const Header = () => {
	const { isHidden, isScrolled } = useHeaderScrollState()

	return (
		<header
			aria-hidden={isHidden}
			inert={isHidden}
			className={cn(
				'absolute inset-x-0 top-0 z-50 flex h-15 items-center justify-between gap-2 border-b bg-card/88 pr-2 pl-4 backdrop-blur-lg backdrop-filter transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none lg:static lg:h-16 lg:justify-start lg:gap-3 lg:border-b-0 lg:bg-background lg:pr-6 lg:pl-3 lg:backdrop-blur-none lg:dark:bg-sidebar',
				isHidden && '-translate-y-full pointer-events-none lg:translate-y-0 lg:pointer-events-auto',
				isScrolled && 'shadow-sm lg:shadow-none',
			)}
		>
			<div
				data-testid='header-logo'
				className='lg:hidden'
			>
				<Logo testId='application-header-logo' wordmarkClassName='font-display text-xl leading-none font-bold tracking-tight' />
			</div>

			<div className='hidden items-center gap-2 lg:flex'>
				<SidebarTrigger
					size='icon'
					rounded='lg'
				/>
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
