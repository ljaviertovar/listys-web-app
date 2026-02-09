'use client'

import { ReactNode, memo } from 'react'

interface Props {
	children: ReactNode
}

function PageContainerContent({ children }: Props) {
	return (
		<div className='flex-1 flex flex-col pb-20'>
			<div className='container mx-auto max-w-7xl space-y-6 p-4 md:p-6'>{children}</div>
		</div>
	)
}

export default memo(PageContainerContent)
