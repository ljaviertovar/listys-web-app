import { Separator } from '@/components/ui/separator'
import { ReactNode } from 'react'

interface Props {
	title: string
	desc: string
	children?: ReactNode
}

export default function PageHeader({ title, desc, children }: Props) {
	return (
		<header>
			<div className='w-full max-w-7xl m-auto flex items-center justify-between align-center mb-4 gap-4 p-4 lg:p-6'>
				<div className='space-y-0.5'>
					<h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{title}</h1>
					<p className='text-muted-foreground'>{desc}</p>
				</div>
				{children && <div className='flex items-center gap-2'>{children}</div>}
			</div>
		</header>
	)
}
