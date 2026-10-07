import type { NavItem } from '@/types'

/** Whether a nav entry (or one of its children) is the current page. `href` may carry a query string. */
export function checkIsActive(href: string, item: NavItem, mainNav = false) {
	return (
		href === item.url || // /endpint?search=param
		href.split('?')[0] === item.url || // endpoint
		!!item?.items?.filter(i => i.url === href).length || // if child nav is active
		(mainNav && href.split('/')[1] !== '' && href.split('/')[1] === item?.url?.split('/')[1])
	)
}
