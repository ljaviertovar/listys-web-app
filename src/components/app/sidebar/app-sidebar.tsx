'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar'
import AppSidebarFooter from './app-sidebar-footer'
import { NavGroup } from './nav-group'
import Logo from '@/components/commons/logo'

import { SIDEBAR_DATA } from '@/data/constants'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar()

	return (
		<Sidebar
			collapsible='icon'
			variant='sidebar'
			{...props}
		>
			<SidebarHeader className='bg-card flex h-16 items-center gap-3 p-4 sm:gap-4 border-b border-sidebar-border'>
				<div className='grid place-content-center h-full'>
					<Logo isCollapsed={state === 'collapsed'} />
				</div>
			</SidebarHeader>
			<SidebarContent className='bg-card [&_[data-slot=sidebar-menu-button]]:transition-all [&_[data-slot=sidebar-menu-button]]:duration-200 [&_[data-slot=sidebar-menu-button]]:hover:bg-primary/10 [&_[data-slot=sidebar-menu-button]]:hover:text-primary [&_[data-slot=sidebar-menu-button][data-active=true]]:bg-primary [&_[data-slot=sidebar-menu-button][data-active=true]]:text-primary-foreground [&_[data-slot=sidebar-menu-button][data-active=true]]:shadow-sm [&_[data-slot=sidebar-menu-sub-button]]:transition-all [&_[data-slot=sidebar-menu-sub-button]]:duration-200 [&_[data-slot=sidebar-menu-sub-button]]:hover:bg-primary/10 [&_[data-slot=sidebar-menu-sub-button]]:hover:text-primary [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:bg-primary/15 [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:text-primary [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:font-semibold'>
				{SIDEBAR_DATA.navGroups.map(props => (
					<NavGroup
						key={props.title}
						{...props}
					/>
				))}
			</SidebarContent>
			<SidebarFooter className='bg-card'>{state !== 'collapsed' && <AppSidebarFooter />}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
