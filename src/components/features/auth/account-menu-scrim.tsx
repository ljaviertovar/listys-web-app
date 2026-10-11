'use client'

import { createPortal } from 'react-dom'

/**
 * Phones only (design A1 mobile): dims the page under the open account menu, from the header down and over the tab bar,
 * so the menu reads as modal while the avatar stays visible. It is portalled to the body because the header's backdrop
 * blur would otherwise become the containing block of a fixed child.
 */
export function AccountMenuScrim() {
	return createPortal(
		<div
			aria-hidden='true'
			data-testid='account-menu-scrim'
			className='fixed inset-x-0 top-15 bottom-0 z-[45] bg-slate-900/40 duration-150 animate-in fade-in-0 lg:hidden'
		/>,
		document.body,
	)
}
