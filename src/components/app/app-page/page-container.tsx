'use client'

import { ReactNode, memo } from 'react'

import { cn } from '@/utils'
import { MOBILE_TAB_BAR_CLEARANCE } from '../helpers/mobile-tab-bar-layout'

interface Props {
	children: ReactNode
	/** Overrides for the outer wrapper, e.g. a smaller bottom padding on a page without a pinned bottom action. */
	className?: string
	/** Adjusts spacing between the content sections without changing the app-wide page rhythm. */
	contentClassName?: string
}

function PageContainerContent({ children, className, contentClassName }: Props) {
	return (
		<div className={cn('flex-1 flex flex-col', MOBILE_TAB_BAR_CLEARANCE, 'lg:pb-20', className)}>
			<div className={cn('container mx-auto max-w-7xl space-y-6 p-4 pb-8 md:p-6 lg:p-8', contentClassName)}>{children}</div>
		</div>
	)
}

export default memo(PageContainerContent)
