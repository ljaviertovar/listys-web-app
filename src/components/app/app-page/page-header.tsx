'use client'

import { ReactNode, memo } from 'react'

import BackLink from '../back-link'

interface Props {
	title: string
	desc: ReactNode
	children?: ReactNode
	aside?: ReactNode
	/**
	 * `banner` is the original white band with a bottom border. `screen` sits on the page ground without a band;
	 * `screenStyle='entity-detail'` applies the 24px, two-line title used by receipt, trip and list details.
	 */
	variant?: 'banner' | 'screen'
	/** Only used by `screen`: the link above the title. */
	back?: { href: string; label: string }
	/** Applies the shared object-detail title rhythm to a screen header. */
	screenStyle?: 'default' | 'entity-detail'
	/** Keeps a screen action beside its supporting copy when the design aligns it with the description. */
	asidePlacement?: 'title' | 'description'
}

function PageHeaderContent({ title, desc, children, variant = 'banner', back, aside, screenStyle = 'default', asidePlacement = 'title' }: Props) {
	if (variant === 'screen') {
		const isEntityDetail = screenStyle === 'entity-detail'
		const titleRowClassName = isEntityDetail ? 'flex items-start justify-between gap-3' : 'flex items-center justify-between gap-3'
		const titleClassName = isEntityDetail
			? 'line-clamp-2 min-w-0 flex-1 font-display text-2xl leading-[1.2] font-bold tracking-tight'
			: 'w-full max-w-[25ch] truncate font-display text-2xl leading-[1.17] font-bold tracking-tight text-balance md:text-3xl lg:text-4xl'
		const descriptionClassName = isEntityDetail ? 'text-sm leading-normal text-body' : 'text-sm leading-normal text-muted-foreground md:text-base dark:text-muted-foreground'
		const descriptionRowClassName = isEntityDetail ? 'flex items-start justify-between gap-3' : 'flex items-end justify-between gap-3'
		return (
			<header
				data-testid='page-header'
				data-variant='screen'
				className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-5 md:flex-row md:items-end md:justify-between md:px-6 md:pt-6 lg:px-8'
			>
				<div className={`flex min-w-0 flex-1 flex-col ${isEntityDetail ? 'gap-1.5' : 'gap-2'}`}>
					{back ? (
						<BackLink
							href={back.href}
							label={back.label}
							variant='screen'
						/>
					) : null}
					<div className={titleRowClassName}>
						<h1 className={titleClassName}>
							{title}
						</h1>
						{asidePlacement === 'title' && aside ? <div className={isEntityDetail ? 'shrink-0 pt-1' : undefined}>{aside}</div> : null}
					</div>
					{asidePlacement === 'description' && aside ? (
						<div className={descriptionRowClassName}>
							<div className={`min-w-0 flex-1 ${descriptionClassName}`}>{desc}</div>
							{aside}
						</div>
					) : desc ? (
						<div className={descriptionClassName}>{desc}</div>
					) : null}
					{children}
				</div>
			</header>
		)
	}

	return (
		<header data-testid='page-header' className='w-full border-b bg-card'>
			<div className='w-full max-w-7xl m-auto flex items-center justify-between align-center gap-4 px-4 py-3 md:px-6 lg:px-8 lg:py-4'>
				<div className='space-y-0.5'>
					<div className='flex items-center justify-between gap-3'><h1 className='text-lg font-bold tracking-tight md:text-2xl truncate w-full max-w-[25ch]'>{title}</h1>{aside}</div>
				{desc ? <div className='text-sm text-muted-foreground md:text-base tabular-nums'>{desc}</div> : null}
				</div>
			</div>
			<div className='w-full max-w-7xl m-auto md:px-6 md:pb-3 lg:px-8 lg:pb-4'>{children}</div>
		</header>
	)
}

export default memo(PageHeaderContent)
