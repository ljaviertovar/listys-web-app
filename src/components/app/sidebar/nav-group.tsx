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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { NavCollapsible, NavLink, type NavGroup } from '@/types'
import { checkIsActive } from './helpers/check-is-active'
import type { NavCount } from './helpers/build-nav-counts'
import { NavCountPill } from '../nav-count-pill'
import Link from 'next/link'
import { ReactNode } from 'react'

/*
 * Design A1: 44px entries with a 12px radius, slate text and a quiet slate hover, a slate icon that turns blue, and, for the
 * current page, a soft blue fill, semibold blue text and a 3px blue marker just outside the entry. `overflow-visible` lets
 * the marker show (the base button clips); the icon shrinks back to 16px when the sidebar collapses to icons.
 */
const SIDEBAR_ITEM_STYLES =
	'relative h-11 gap-3 overflow-visible group-data-[collapsible=icon]:overflow-hidden rounded-xl px-3 font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-foreground dark:text-foreground/80 dark:hover:bg-muted [&_svg]:size-5 [&_svg]:text-slate-500 hover:[&_svg]:text-slate-700 group-data-[collapsible=icon]:[&_svg]:size-4 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:[&_svg]:text-primary data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:-left-1 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary data-[active=true]:hover:bg-primary/10'
const SIDEBAR_SUB_ITEM_STYLES =
	'transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:font-semibold'

export function NavGroup({ title, items, counts }: NavGroup & { counts?: Record<string, NavCount> }) {
	const { state } = useSidebar()

	const href = `${usePathname()}?${useSearchParams().toString()}`

	return (
		<SidebarGroup className='px-3 pt-6 pb-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-2'>
			<SidebarGroupLabel className='h-auto rounded-none px-3 pt-0 pb-2 text-[11px] leading-none font-semibold tracking-[0.08em] text-slate-500 uppercase group-data-[collapsible=icon]:hidden'>
				{title}
			</SidebarGroupLabel>
			<SidebarMenu className='gap-0.5'>
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

					if (state === 'collapsed')
						return (
							<SidebarMenuCollapsedDropdown
								key={key}
								item={item}
								href={href}
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
				tooltip={item.title}
				className={SIDEBAR_ITEM_STYLES}
			>
				<Link
					href={item.url}
					onClick={() => setOpenMobile(false)}
				>
					{item.icon && (
						<HugeiconsIcon
							icon={item.icon}
							strokeWidth={2}
						/>
					)}
					<span>{item.title}</span>
					{item.badge && <NavBadge>{item.badge}</NavBadge>}
					{count ? (
						<NavCountPill
							count={count}
							testId={`sidebar-count-${item.url.slice(1)}`}
							className='group-data-[collapsible=icon]:hidden'
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
					<SidebarMenuButton
						tooltip={item.title}
						className={SIDEBAR_ITEM_STYLES}
					>
						{item.icon && (
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={2}
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
												strokeWidth={2}
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

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: NavCollapsible; href: string }) => {
	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						tooltip={item.title}
						isActive={checkIsActive(href, item)}
						className={SIDEBAR_ITEM_STYLES}
					>
						{item.icon && (
							<HugeiconsIcon
								icon={item.icon}
								strokeWidth={2}
							/>
						)}
						<span>{item.title}</span>
						{item.badge && <NavBadge>{item.badge}</NavBadge>}
						<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side='right'
					align='start'
					sideOffset={4}
				>
					<DropdownMenuLabel>
						{item.title} {item.badge ? `(${item.badge})` : ''}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{item.items.map(sub => (
						<DropdownMenuItem
							key={`${sub.title}-${sub.url}`}
							asChild
						>
							<Link
								href={sub.url}
								className={`${checkIsActive(href, sub) ? 'bg-primary/15 text-primary font-semibold' : ''} gap-2 rounded-md transition-colors hover:bg-primary/10 hover:text-primary`}
							>
								{sub.icon && (
									<HugeiconsIcon
										icon={sub.icon}
										strokeWidth={2}
										className='w-4'
									/>
								)}
								<span className='max-w-52 text-wrap'>{sub.title}</span>
								{sub.badge && <span className='ml-auto text-xs'>{sub.badge}</span>}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	)
}
