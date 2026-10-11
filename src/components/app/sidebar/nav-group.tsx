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

/*
 * Design A1 desktop: 36px entries on one line with an 18px icon, an 8px radius and a quiet slate hover. The icon is slate and
 * turns blue with the text on the current page, which sits on the secondary-button surface (#E9ECF0) with semibold blue text,
 * the same treatment as the phone tab bar.
 */
const SIDEBAR_ITEM_STYLES =
	'h-9 gap-2 rounded-[8px] px-2 text-sm font-normal whitespace-nowrap text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-foreground [&_svg]:size-[18px] [&_svg]:text-slate-500 hover:[&_svg]:text-slate-700 data-[active=true]:[&_svg]:text-blue-700 dark:text-foreground/80 dark:hover:bg-muted data-[active=true]:bg-[#E9ECF0] data-[active=true]:font-semibold data-[active=true]:text-blue-700 data-[active=true]:hover:bg-[#DEE2E8] data-[active=true]:hover:text-blue-700 dark:data-[active=true]:bg-muted dark:data-[active=true]:text-blue-300'
const SIDEBAR_SUB_ITEM_STYLES =
	'rounded-[8px] text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-foreground data-[active=true]:bg-[#E9ECF0] data-[active=true]:font-semibold data-[active=true]:text-blue-700'

export function NavGroup({ title, items, counts }: NavGroup & { counts?: Record<string, NavCount> }) {
	const href = `${usePathname()}?${useSearchParams().toString()}`

	return (
		<SidebarGroup className='gap-0.5 p-0'>
			<SidebarGroupLabel className='h-9 rounded-none px-2 text-sm font-semibold text-foreground'>{title}</SidebarGroupLabel>
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
	<Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
)

const SidebarMenuLink = ({ item, href, count }: { item: NavLink; href: string; count?: NavCount }) => {
	const { setOpenMobile } = useSidebar()
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={checkIsActive(href, item)}
				className={SIDEBAR_ITEM_STYLES}
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
					<SidebarMenuButton className={SIDEBAR_ITEM_STYLES}>
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
									className={SIDEBAR_SUB_ITEM_STYLES}
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
