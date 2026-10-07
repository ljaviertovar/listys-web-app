'use client'

import { usePathname } from 'next/navigation'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar'
import AppSidebarFooter from './app-sidebar-footer'
import { NavGroup } from './nav-group'
import { buildNavCounts } from './helpers/build-nav-counts'
import { NavSessionCard } from '../nav-session-card'
import { useNavSummary } from '../hooks/use-nav-summary'
import Logo from '@/components/commons/logo'
import useActiveSessionStore from '@/stores/active-session'

import { SIDEBAR_DATA } from '@/data/constants'

/**
 * The persistent desktop navigation (design A1): the logo over a hairline, sections with small uppercase labels, count
 * pills on the entries that have something to count, and, at the foot, the running session and the author credit. When
 * the sidebar is collapsed to icons, the counts, the session card and the credit are left out.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar()
	const pathname = usePathname()
	const activeSession = useActiveSessionStore(s => s.activeSession)
	const isExpanded = state !== 'collapsed'
	// Fetched again on every page change, so the counts follow what the user just did.
	const summary = useNavSummary({ enabled: isExpanded, sessionId: activeSession?.id ?? null, refreshKey: pathname })
	const counts = buildNavCounts(summary)

	return (
		<Sidebar
			collapsible='icon'
			variant='sidebar'
			{...props}
		>
			<SidebarHeader className='bg-card flex h-16 flex-row items-center justify-start gap-3 border-b border-sidebar-border px-[22px] py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'>
				<Logo isCollapsed={state === 'collapsed'} />
			</SidebarHeader>
			<SidebarContent className='bg-card gap-0 pb-3 [&_[data-slot=sidebar-menu-sub-button]]:transition-all [&_[data-slot=sidebar-menu-sub-button]]:duration-200 [&_[data-slot=sidebar-menu-sub-button]]:hover:bg-primary/10 [&_[data-slot=sidebar-menu-sub-button]]:hover:text-primary [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:bg-primary/15 [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:text-primary [&_[data-slot=sidebar-menu-sub-button][data-active=true]]:font-semibold'>
				{SIDEBAR_DATA.navGroups.map(props => (
					<NavGroup
						key={props.title}
						counts={counts}
						{...props}
					/>
				))}
			</SidebarContent>
			<SidebarFooter className='bg-card gap-3 p-3'>
				{isExpanded && (
					<>
						{activeSession ? (
							<NavSessionCard
								sessionId={activeSession.id}
								name={activeSession.name ?? ''}
								progress={summary.progress}
							/>
						) : null}
						<AppSidebarFooter className='p-0 px-2 pt-1 pb-1.5 text-[12.5px] text-slate-500' />
					</>
				)}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
