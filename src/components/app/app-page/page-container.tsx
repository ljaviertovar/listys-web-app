'use client'

import { ReactNode, memo } from 'react'

import { cn } from '@/utils'
import { MOBILE_TAB_BAR_CLEARANCE } from '../helpers/mobile-tab-bar-layout'

interface Props {
	children: ReactNode
	/** Overrides for the outer wrapper, e.g. a smaller bottom padding on a page without a pinned bottom action. */
	className?: string
}

function PageContainerContent({ children, className }: Props) {
	return (
		<div className={cn('flex-1 flex flex-col', MOBILE_TAB_BAR_CLEARANCE, 'lg:pb-20', className)}>
			<div className='container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8'>{children}</div>
		</div>
	)
}

export default memo(PageContainerContent)
