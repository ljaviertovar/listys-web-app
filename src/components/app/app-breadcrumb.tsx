'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

import { SIDEBAR_DATA } from '@/data/constants'
import { findBreadcrumb } from './sidebar/helpers/find-breadcrumb'

/** Desktop only: where the current page sits in the navigation, as "Section › Page", at the left of the top bar. */
export function AppBreadcrumb() {
	const breadcrumb = findBreadcrumb(usePathname(), SIDEBAR_DATA.navGroups)
	if (!breadcrumb) return null

	return (
		<Breadcrumb
			aria-label='Breadcrumb'
			data-testid='app-breadcrumb'
			className='hidden lg:block'
		>
			<BreadcrumbList>
				<BreadcrumbItem>{breadcrumb.section}</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem><BreadcrumbPage>{breadcrumb.page}</BreadcrumbPage></BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	)
}
