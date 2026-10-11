'use client'

import { usePathname } from 'next/navigation'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { SIDEBAR_DATA } from '@/data/constants'
import { findBreadcrumb } from './sidebar/helpers/find-breadcrumb'

/** Desktop only: where the current page sits in the navigation, as "Section › Page", at the left of the top bar. */
export function AppBreadcrumb() {
	const breadcrumb = findBreadcrumb(usePathname(), SIDEBAR_DATA.navGroups)
	if (!breadcrumb) return null

	return (
		<nav
			aria-label='Breadcrumb'
			data-testid='app-breadcrumb'
			className='hidden items-center gap-2 text-sm text-muted-foreground lg:flex'
		>
			<span>{breadcrumb.section}</span>
			<HugeiconsIcon
				icon={ArrowRight01Icon}
				strokeWidth={2}
				aria-hidden='true'
				className='size-3.5 text-slate-400'
			/>
			<span
				aria-current='page'
				className='font-medium text-foreground'
			>
				{breadcrumb.page}
			</span>
		</nav>
	)
}
