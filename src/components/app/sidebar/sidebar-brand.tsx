import Link from 'next/link'

import { LogoMark } from '@/components/commons/logo'

/** Top of the sidebar (design A1 desktop): the Listys mark with its name and a one-line description, as a link home. */
export function SidebarBrand() {
	return (
		<Link
			href='/'
			aria-label='Listys home'
			data-testid='sidebar-brand'
			className='flex min-h-16 items-center gap-2.5 rounded-[8px] p-2 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:hover:bg-muted'
		>
			<LogoMark className='size-8 shrink-0' />
			<span className='flex min-w-0 flex-col gap-[3px]'>
				<span className='font-display text-sm leading-[1.15] font-semibold tracking-[-0.01em] text-foreground'>Listys</span>
				<span className='text-xs leading-[1.15] text-slate-500 dark:text-muted-foreground'>Shared shopping lists</span>
			</span>
		</Link>
	)
}
