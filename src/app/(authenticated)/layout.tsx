import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/sidebar'
import { Header } from '@/components/app/header'

import { createClient } from '@/lib/supabase/server'

import { cn } from '@/utils/cn'

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
			<SidebarProvider defaultOpen={defaultOpen}>
				<AppSidebar />
				<div
					id='content'
					className={cn(
						'ml-auto w-full max-w-full',
						'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
						'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
						'sm:transition-[width] sm:duration-200 sm:ease-linear',
						'flex h-dvh flex-col',
						'group-data-[scroll-locked=1]/body:h-full',
						'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-dvh',
					)}
				>
					<Header />
					<main className='flex-1 overflow-y-auto bg-sidebar'>
						<div className='flex flex-col min-h-full'>{children}</div>
					</main>
				</div>
			</SidebarProvider>
		</>
	)
}
