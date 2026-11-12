import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SidebarProvider } from '@/components/ui/sidebar'
import { ActiveSessionBar, AppSidebar, Header, MobileTabBar, TripNavigationProvider } from '@/components/app'

import { createClient } from '@/lib/supabase/server'
import { TripSyncProvider } from '@/components/features/shopping-sessions/trip-sync-provider'

import { cn } from '@/utils'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (!user) {
		redirect('/auth/signin')
	}

	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

	return (
		<TripSyncProvider key={user.sub} userId={user.sub}>
		<TripNavigationProvider>
			<SidebarProvider
				defaultOpen={defaultOpen}
				// The page ground also shows around the floating sidebar, so it is set here and not only on <main>.
				className='relative h-dvh overflow-hidden'
			>
				<a href='#main-content' className='focus-ring fixed top-2 left-2 z-[100] -translate-y-20 rounded-lg bg-card px-4 py-3 font-medium text-foreground shadow-lg focus:translate-y-0'>
					Skip to main content
				</a>
				<div className='hidden lg:block'>
					<AppSidebar />
				</div>

				<div
					id='content'
					className={cn(
						'relative w-full min-w-0 max-w-full flex-1',
						'flex h-dvh flex-col',
						'group-data-[scroll-locked=1]/body:h-full',
						'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-dvh',
					)}
				>
					<Header />
					{/* scroll-pb keeps a focused control clear of the pinned bottom bars (the dashboard's phone session bar is 72px+). */}
					{/* The page ground of design A1 (#F2F4F7); the dark theme keeps its own sidebar token. */}
				<main id='main-content' tabIndex={-1} className='flex-1 scroll-pb-24 overflow-y-auto bg-background pt-15 focus:outline-none max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden dark:bg-sidebar lg:pt-0'>
						{children}
					</main>
					{/* Phones: reserve its full footprint after the scroll viewport to keep content clear. */}
					<ActiveSessionBar />
					<MobileTabBar />
				</div>
			</SidebarProvider>
		</TripNavigationProvider>
		</TripSyncProvider>
	)
}
