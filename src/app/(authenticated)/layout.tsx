import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar, Header, MobileTabBar } from '@/components/app'

import { createClient } from '@/lib/supabase/server'

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
		<>
			<SidebarProvider
				defaultOpen={defaultOpen}
				// The page ground also shows around the floating sidebar, so it is set here and not only on <main>.
				className='relative h-dvh overflow-hidden bg-[#F2F4F7] dark:bg-sidebar'
			>
				<div className='hidden lg:block'>
					<AppSidebar />
				</div>

				<div
					id='content'
					className={cn(
						'w-full min-w-0 max-w-full flex-1',
						'flex h-dvh flex-col',
						'group-data-[scroll-locked=1]/body:h-full',
						'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-dvh',
					)}
				>
					<Header />
					{/* scroll-pb keeps a focused control clear of the pinned bottom bars (the dashboard's phone session bar is 72px+). */}
					{/* The page ground of design A1 (#F2F4F7); the dark theme keeps its own sidebar token. */}
					<main className='flex-1 scroll-pb-24 overflow-y-auto bg-[#F2F4F7] dark:bg-sidebar'>
						<div className='flex flex-col min-h-full'>{children}</div>
					</main>
					<MobileTabBar />
				</div>
			</SidebarProvider>
		</>
	)
}
