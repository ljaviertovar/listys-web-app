import { NavItem, SidebarData } from '@/types'
import {
	DashboardSquare02Icon,
	FolderLibraryIcon,
	TimeQuarterPassIcon,
	Invoice01Icon,
	UserSettings01Icon,
	Settings02Icon,
} from '@hugeicons/core-free-icons'

export const NAV_ITEMS: any[] = [
	{
		title: 'Dashboard',
		href: '/dashboard',
		icon: DashboardSquare02Icon,
		submenu: false,
		subMenuItems: [],
	},
]

export const MARKETING_SECTION_LINKS = [
	{ label: 'Shared Lists', href: '/#shared-lists' },
	{ label: 'How It Works', href: '/#how-it-works' },
	{ label: 'FAQ', href: '/#faq' },
	{ label: 'Get Started', href: '/#get-started' },
]

export const SIDEBAR_DATA: SidebarData = {
	navGroups: [
		{
			title: 'Shopping',
			items: [
				{
					title: 'Dashboard',
					url: '/dashboard',
					icon: DashboardSquare02Icon,
				},
				{
					title: 'Shopping List Groups',
					url: '/shopping-lists',
					icon: FolderLibraryIcon,
				},
				{
					title: 'Shopping History',
					url: '/shopping-history',
					icon: TimeQuarterPassIcon,
				},
			],
		},
		{
			title: 'Management',
			items: [
				{
					title: 'Receipts',
					url: '/tickets',
					icon: Invoice01Icon,
				},
			],
		},
		{
			title: 'Settings',
			items: [
				{
					title: 'Profile',
					url: '/settings/profile',
					icon: UserSettings01Icon,
				},
				{
					title: 'Account',
					url: '/settings/account',
					icon: Settings02Icon,
				},
			],
		},
	],
}

export const USER_NAV_ITEMS: NavItem[] = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: DashboardSquare02Icon,
	},
	{
		title: 'Profile',
		url: '/settings/profile',
		icon: UserSettings01Icon,
	},
	{
		title: 'Account',
		url: '/settings/account',
		icon: Settings02Icon,
	},
]

export const NAV_APP_ITEMS: NavItem[] = [
	{
		title: 'Shopping List Groups',
		url: '/shopping-lists',
		icon: FolderLibraryIcon,
	},
	{
		title: 'Receipts',
		url: '/tickets',
		icon: Invoice01Icon,
	},
	{
		title: 'Shopping History',
		url: '/shopping-history',
		icon: TimeQuarterPassIcon,
	},
]
