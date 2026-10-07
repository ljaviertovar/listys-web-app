import Link from 'next/link'
import { ArrowRight01Icon, Invoice01Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { cn } from '@/utils'
import { FOCUS_RING } from './helpers/dashboard-styles'
import type { UpNextItem, UpNextKind } from './helpers/build-dashboard-model'

// Semantic pairs from DESIGN.md §3.3: warning #B45309 on #FFFBEB, destructive #B91C1C on #FEF2F2, processing/action
// #1D4ED8 on #EFF6FF. Each entry also carries a text cue, so colour is never the only signal.
const KINDS: Record<UpNextKind, { icon: IconSvgElement; card: string; iconBox: string; detail: string }> = {
	'receipt-waiting': {
		icon: Invoice01Icon,
		card: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
		iconBox: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
		detail: 'text-amber-700 dark:text-amber-300',
	},
	'receipt-failed': {
		icon: Invoice01Icon,
		card: 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
		iconBox: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
		detail: 'text-red-700 dark:text-red-300',
	},
	'list-stale': {
		icon: ShoppingCart02Icon,
		card: 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10',
		iconBox: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
		detail: 'text-blue-700 dark:text-blue-300',
	},
}

interface Props {
	items: UpNextItem[]
}

/** Things the household can act on now. Every entry is derived from real receipts, lists and sessions; nothing is a tip. */
export function UpNextList({ items }: Props) {
	if (items.length === 0) return null

	return (
		<section
			data-testid='dashboard-up-next'
			aria-labelledby='dashboard-up-next-title'
			className='flex flex-col gap-3'
		>
			<h2
				id='dashboard-up-next-title'
				className='font-display text-xl leading-tight font-bold tracking-[-0.015em]'
			>
				Up next
			</h2>
			<ul className='flex flex-col gap-3'>
				{items.map(item => {
					const kind = KINDS[item.kind]
					return (
						<li key={item.id}>
							<Link
								href={item.href}
								data-testid={`dashboard-up-next-${item.kind}`}
								className={cn(
									// A1: 18px cards, a 2px lift with a soft shadow on hover, none of it on reduced motion.
									'flex min-h-16 items-center gap-4 rounded-[18px] border p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none',
									kind.card,
									FOCUS_RING,
								)}
							>
								<span className={cn('flex size-11 shrink-0 items-center justify-center rounded-[14px]', kind.iconBox)}>
									<HugeiconsIcon
										icon={kind.icon}
										strokeWidth={1.5}
										className='size-5'
									/>
								</span>
								<span className='flex min-w-0 flex-1 flex-col gap-1'>
									<span className='text-sm leading-[1.3] font-semibold text-foreground'>{item.title}</span>
									<span className={cn('text-[13px] leading-[1.55]', kind.detail)}>{item.detail}</span>
								</span>
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									strokeWidth={2}
									className={cn('size-4 shrink-0', kind.detail)}
								/>
							</Link>
						</li>
					)
				})}
			</ul>
		</section>
	)
}
