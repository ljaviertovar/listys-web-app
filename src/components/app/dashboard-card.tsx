'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface Props {
	href: string
	icon: IconSvgElement
	title: string
	description: string
	count: number
}

function DashboardCardContent({ href, icon, title, description, count }: Props) {
	return (
		<Card
			variant='premium'
			className='group relative cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-white dark:bg-card'
		>
			<Link
				href={href}
				className='flex h-full flex-col'
			>
				{/* Premium Background Effects */}

				<div className='hero-mesh absolute inset-0 opacity-0 dark:opacity-60 transition-opacity duration-500 dark:group-hover:opacity-80' />
				<div className='scan-line z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-20' />

				<CardHeader className='relative z-20 space-y-4 pb-2'>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/5 transition-transform duration-500 group-hover:scale-110'>
						<div className='glossy-icon relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20'>
							<HugeiconsIcon
								icon={icon}
								strokeWidth={2}
								className='h-5 w-5 text-primary-foreground'
							/>
						</div>
					</div>

					<div className='space-y-1.5'>
						<CardTitle className='font-bold tracking-tight text-xl text-foreground group-hover:text-primary transition-colors duration-300'>
							{title}
						</CardTitle>
						<CardDescription className='text-sm font-medium leading-relaxed text-muted-foreground/80 line-clamp-2'>
							{description}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className='relative z-20 mt-auto pt-4'>
					<div className='flex items-baseline justify-between border-t border-border/40 pt-2'>
						<div className='flex items-baseline gap-1'>
							<span className='text-3xl font-black text-foreground tabular-nums tracking-tighter'>
								{count.toLocaleString()}
							</span>
							<span className='text-xs font-bold tracking-widest text-primary/60'>Total items</span>
						</div>

						<div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary'>
							<span>View all</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2.5}
								className='h-3 w-3 transition-transform group-hover:translate-x-0.5'
							/>
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	)
}

export const DashboardCard = memo(DashboardCardContent)
