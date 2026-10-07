'use client'

import { ReactNode, memo } from 'react'

interface Props {
	title: string
	desc: string
	children?: ReactNode
}

function PageHeaderContent({ title, desc, children }: Props) {
	return (
		<header className='w-full border-b bg-card'>
			<div className='w-full max-w-7xl m-auto flex items-center justify-between align-center gap-4 px-4 py-3 md:px-6 lg:px-8 lg:py-4'>
				<div className='space-y-0.5'>
					<h1 className='text-lg font-bold tracking-tight md:text-2xl truncate w-full max-w-[25ch]'>{title}</h1>
					<p className='text-sm text-muted-foreground md:text-md tabular-nums'>{desc}</p>
				</div>
			</div>
			<div className='w-full max-w-7xl m-auto md:px-6 md:pb-3 lg:px-8 lg:pb-4'>{children}</div>
		</header>
	)
}

export default memo(PageHeaderContent)
