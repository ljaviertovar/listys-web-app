'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../../ui/badge'
import { NavCollapsible, NavLink, type NavGroup } from '@/types'
import { checkIsActive } from './helpers/check-is-active'
import type { NavCount } from './helpers/build-nav-counts'
import { NavCountPill } from '../nav-count-pill'
import Link from 'next/link'
import { ReactNode } from 'react'

export function NavGroup({ title, items, counts }: NavGroup & { counts?: Record<string, NavCount> }) {
	const href = `${usePathname()}?${useSearchParams().toString()}`

	return (
		<SidebarGroup className='gap-0.5 p-0'>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu className='gap-px px-1.5'>
				{items.map(item => {
					const key = `${item.title}-${item.url}`

					if (!item.items)
						return (
							<SidebarMenuLink
								key={key}
								item={item}
								href={href}
								count={counts?.[item.url]}
							/>
						)

					return (
						<SidebarMenuCollapsible
							key={key}
							item={item}
							href={href}
						/>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}

const NavBadge = ({ children }: { children: ReactNode }) => (
	<Badge>{children}</Badge>
)

const SidebarMenuLink = ({ item, href, count }: { item: NavLink; href: string; count?: NavCount }) => {
	const { setOpenMobile } = useSidebar()
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={checkIsActive(href, item)}
			>
				<Link
					href={item.url}
					onClick={() => setOpenMobile(false)}
				>
					{item.icon && (
						<HugeiconsIcon
							icon={item.icon}
							strokeWidth={1.5}
							aria-hidden='true'
						/>
					)}
					<span>{item.title}</span>
					{item.badge && <NavBadge>{item.badge}</NavBadge>}
					{count ? (
						<NavCountPill
							count={count}
							testId={`sidebar-count-${item.url.slice(1)}`}
						/>
					) : null}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}

const SidebarMenuCollapsible = ({ item, href }: { item: NavCollapsible; href: string }) => {
	const { setOpenMobile } = useSidebar()
	return (
		<Collapsible
			asChild
			defaultOpen={checkIsActive(href, item, true)}
			className='group/collapsible'
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton>
						{item.icon && (
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={1.5}
								aria-hidden='true'
							/>
						)}
						<span>{item.title}</span>
						{item.badge && <NavBadge>{item.badge}</NavBadge>}
						<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent className='CollapsibleContent'>
					<SidebarMenuSub>
						{item.items.map(subItem => (
							<SidebarMenuSubItem key={subItem.title}>
								<SidebarMenuSubButton
									asChild
									isActive={checkIsActive(href, subItem)}
								>
									<Link
										href={subItem.url}
										onClick={() => setOpenMobile(false)}
									>
										{subItem.icon && (
											<HugeiconsIcon
												icon={subItem.icon}
												strokeWidth={1.5}
												aria-hidden='true'
											/>
										)}
										<span>{subItem.title}</span>
										{subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	)
}
