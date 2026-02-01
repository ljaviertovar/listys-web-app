import { ReactNode } from 'react'

interface Props {
	title: string
	desc: string
	children?: ReactNode
}

export default function PageHeader({ title, desc, children }: Props) {
	return (
		<header className='w-full border-b bg-card'>
			<div className='w-full max-w-7xl m-auto flex items-center justify-between align-center gap-4 p-3 lg:p-4'>
				<div className='space-y-0.5'>
					<h1 className='text-lg font-bold tracking-tight md:text-2xl truncate w-full max-w-[25ch]'>{title}</h1>
					<p className='text-sm text-muted-foreground md:text-md'>{desc}</p>
				</div>
				{children && <div className='flex items-center gap-2'>{children}</div>}
			</div>
		</header>
	)
}
