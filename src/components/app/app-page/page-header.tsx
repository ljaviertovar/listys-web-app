'use client'

import { ReactNode, memo } from 'react'

import BackLink from '../back-link'

interface Props {
	title: string
	desc: ReactNode
	children?: ReactNode
	/**
	 * `banner` is the original white band with a bottom border. `screen` is the A1 header: no band, on the page ground,
	 * with the back link above a 30px title, the way the dashboard greeting is set.
	 */
	variant?: 'banner' | 'screen'
	/** Only used by `screen`: the link above the title. */
	back?: { href: string; label: string }
}

function PageHeaderContent({ title, desc, children, variant = 'banner', back }: Props) {
	if (variant === 'screen') {
		return (
			<header
				data-testid='page-header'
				data-variant='screen'
				className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-3 md:flex-row md:items-end md:justify-between md:px-6 md:pt-6 lg:px-8'
			>
				<div className='flex min-w-0 flex-col gap-2'>
					{back ? (
						<BackLink
							href={back.href}
							label={back.label}
							variant='screen'
						/>
					) : null}
					<h1 className='font-display text-3xl leading-[1.17] font-bold tracking-tight text-balance lg:text-4xl'>
						{title}
					</h1>
					<p className='text-sm leading-normal text-slate-500 md:text-base dark:text-muted-foreground'>{desc}</p>
				</div>
				{children}
			</header>
		)
	}

	return (
		<header className='w-full border-b bg-card'>
			<div className='w-full max-w-7xl m-auto flex items-center justify-between align-center gap-4 px-4 py-3 md:px-6 lg:px-8 lg:py-4'>
				<div className='space-y-0.5'>
					<h1 className='text-lg font-bold tracking-tight md:text-2xl truncate w-full max-w-[25ch]'>{title}</h1>
					<p className='text-sm text-muted-foreground md:text-base tabular-nums'>{desc}</p>
				</div>
			</div>
			<div className='w-full max-w-7xl m-auto md:px-6 md:pb-3 lg:px-8 lg:pb-4'>{children}</div>
		</header>
	)
}

export default memo(PageHeaderContent)
