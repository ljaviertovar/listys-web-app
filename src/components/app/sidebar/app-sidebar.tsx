'use client'

import { usePathname } from 'next/navigation'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@/components/ui/sidebar'
import AppSidebarFooter from './app-sidebar-footer'
import { NavGroup } from './nav-group'
import { SidebarBrand } from './sidebar-brand'
import { buildNavCounts } from './helpers/build-nav-counts'
import { NavSessionCard } from '../nav-session-card'
import { useNavSummary } from '../hooks/use-nav-summary'
import useActiveSessionStore from '@/stores/active-session'

import { SIDEBAR_DATA } from '@/data/constants'

/**
 * The persistent desktop navigation (design A1 desktop): a floating white panel with the brand, groups titled in
 * semibold with plain text entries (no icons), count pills on the entries that have something to count, and, at the foot,
 * the running session and the author credit. The top bar's trigger hides it completely.
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
			collapsible='offcanvas'
			variant='floating'
			{...props}
		>
			<SidebarHeader className='bg-card p-2'>
				<SidebarBrand />
			</SidebarHeader>
			<SidebarContent className='bg-card gap-3 p-2'>
				{SIDEBAR_DATA.navGroups.map(props => (
					<NavGroup
						key={props.title}
						counts={counts}
						{...props}
					/>
				))}
			</SidebarContent>
			<SidebarFooter className='bg-card gap-3 p-2'>
				{activeSession ? (
					<NavSessionCard
						sessionId={activeSession.id}
						name={activeSession.name ?? ''}
						progress={summary.progress}
					/>
				) : null}
				<AppSidebarFooter className='p-0 px-2 pt-1 pb-1.5 text-[12.5px] text-slate-500' />
			</SidebarFooter>
		</Sidebar>
	)
}
