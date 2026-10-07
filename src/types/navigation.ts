type NavigationIcon = typeof import('@hugeicons/core-free-icons').DashboardSquare02Icon

export type NavItemO = {
	title: string
	href: string
	icon?: NavigationIcon
	submenu?: boolean
	subMenuItems?: NavItemO[]
}

type BaseNavItem = {
	title: string
	badge?: string
	icon?: NavigationIcon
}

export type NavLink = BaseNavItem & {
	url: string
	items?: never
}

export type NavCollapsible = BaseNavItem & {
	items: (BaseNavItem & { url: string })[]
	url?: never
}

export type NavItem = NavCollapsible | NavLink

export type NavGroup = {
	title: string
	items: NavItem[]
}

export type SidebarData = {
	navGroups: NavGroup[]
}
