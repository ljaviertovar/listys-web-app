import type { ReactNode } from 'react'

/**
 * The right-hand side of every item row, in every screen: the price on top and the quantity and unit right under it. A row
 * with no price shows only the quantity, so the units always sit in the same place.
 */
export function ItemTrailing({ children }: { children: ReactNode }) {
	return <span className='flex shrink-0 flex-col items-end gap-1.5 pl-2'>{children}</span>
}
