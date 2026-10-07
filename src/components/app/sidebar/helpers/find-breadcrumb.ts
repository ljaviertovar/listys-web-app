import type { NavGroup } from '@/types'

export interface Breadcrumb {
	section: string
	page: string
}

/**
 * Where the current page sits in the navigation: its section ("Shopping") and its entry ("Dashboard"). Pages below an
 * entry (`/shopping-lists/123/lists`) belong to it; the longest matching entry wins. Pages that are in no entry have none.
 */
export function findBreadcrumb(pathname: string, groups: NavGroup[]): Breadcrumb | null {
	let best: (Breadcrumb & { length: number }) | null = null

	for (const group of groups) {
		for (const item of group.items) {
			const url = item.url
			if (!url || (pathname !== url && !pathname.startsWith(`${url}/`))) continue
			if (!best || url.length > best.length) best = { section: group.title, page: item.title, length: url.length }
		}
	}

	return best ? { section: best.section, page: best.page } : null
}
