import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowRight01Icon, Invoice01Icon, ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { cn } from '@/utils'
import { CARD_SURFACE, FOCUS_RING, ROW_HOVER } from './helpers/dashboard-styles'
import { RowIcon } from './row-icon'
import type { UpNextItem, UpNextKind } from './helpers/build-dashboard-model'

// Warning, destructive and action tones of DESIGN.md §3.3. Each entry also carries its own text, so colour is never the only signal.
const KINDS: Record<UpNextKind, { icon: IconSvgElement; tone: 'warning' | 'danger' | 'primary' }> = {
	'receipt-waiting': { icon: Invoice01Icon, tone: 'warning' },
	'receipt-failed': { icon: Invoice01Icon, tone: 'danger' },
	'list-stale': { icon: ShoppingCart02Icon, tone: 'primary' },
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
			{/* As tall as the section titles that have a "View all" link, so the two kinds of title line up. */}
			<div className='flex min-h-10 items-center'>
				<h2
					id='dashboard-up-next-title'
					className='font-display text-base leading-normal font-semibold tracking-[-0.005em] md:text-xl md:leading-[1.39] md:tracking-[-0.01em]'
				>
					Up Next
				</h2>
			</div>
			<Card className={cn('gap-0 p-1.5', CARD_SURFACE)}>
				<ul className='flex flex-col'>
					{items.map((item, index) => {
						const kind = KINDS[item.kind]
						return (
							<Fragment key={item.id}>
								{index > 0 ? (
									<li
										aria-hidden='true'
										className='mr-3 ml-16 h-px bg-slate-100 dark:bg-border'
									/>
								) : null}
								<li>
									<Link
										href={item.href}
										data-testid={`dashboard-up-next-${item.kind}`}
										className={cn(
											'flex min-h-16 items-center gap-3 rounded-[14px] px-3 py-2.5 transition-colors duration-150',
											ROW_HOVER,
											FOCUS_RING,
										)}
									>
										<RowIcon
											icon={kind.icon}
											tone={kind.tone}
											size='lg'
											emphasis='medium'
										/>
										<span className='flex min-w-0 flex-1 flex-col gap-[3px]'>
											<span className='text-sm leading-[1.3] font-semibold text-foreground'>{item.title}</span>
											<span className='text-[12.5px] leading-[1.4] text-slate-500 dark:text-muted-foreground'>{item.detail}</span>
										</span>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											strokeWidth={2}
											aria-hidden='true'
											className='size-[18px] shrink-0 text-slate-400'
										/>
									</Link>
								</li>
							</Fragment>
						)
					})}
				</ul>
			</Card>
		</section>
	)
}
