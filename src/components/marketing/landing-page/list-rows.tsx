import type { ComponentProps, ReactNode } from 'react'

import { Icon } from './landing-icons'
import { cn } from '@/utils'

/** The list-of-rows wrapper shared by feature previews, how-it-works screens, and device cards. */
export function Rows({ className, ...props }: ComponentProps<'ul'>) {
	return (
		<ul
			className={cn('flex flex-col gap-2', className)}
			{...props}
		/>
	)
}

/** A thin progress bar; `barClassName` lets a caller swap the fill color (e.g. the collab accent). */
export function ProgressBar({
	value,
	className,
	barClassName,
}: {
	value: number
	className?: string
	barClassName?: string
}) {
	return (
		<div className={cn('h-[6px] overflow-hidden rounded-full bg-slate-100', className)}>
			<i
				className={cn('block h-full rounded-full bg-primary', barClassName)}
				style={{ width: `${value}%` }}
			/>
		</div>
	)
}

export function Check({ on, className }: { on?: boolean; className?: string }) {
	return (
		<span
			className={cn(
				'inline-flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-primary/60 bg-white text-transparent [&_svg]:size-[11px]',
				on && 'border-primary bg-primary text-white',
				className,
			)}
		>
			<Icon id='tick' />
		</span>
	)
}

const PILL_STYLES = {
	live: 'bg-green-50 text-green-700',
	scan: 'bg-sky-100 text-sky-700',
	edit: 'bg-blue-50 text-blue-700',
	collab: 'bg-violet-50 text-violet-600',
} as const

export function Pill({ kind, children }: { kind: keyof typeof PILL_STYLES; children: ReactNode }) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 font-mono text-[9px] font-bold tracking-[.09em] uppercase',
				PILL_STYLES[kind],
			)}
		>
			{kind === 'live' && <i className='size-[5px] rounded-full bg-current' />}
			{children}
		</span>
	)
}

export function Avatars({ initials }: { initials: string[] }) {
	return (
		<span className='flex'>
			{initials.map(initial => (
				<span
					key={initial}
					className='-ml-[7px] flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-violet-600 font-mono text-[8px] font-semibold text-white first:ml-0'
				>
					{initial}
				</span>
			))}
		</span>
	)
}

type RowProps = {
	chip: string
	name: string
	meta?: string
	by?: string
	/** undefined hides the checkbox; true/false renders it checked/unchecked. */
	checked?: boolean
	done?: boolean
	dated?: boolean
	live?: boolean
	/** Extra content rendered between the name and the checkbox (a pill or a timestamp). */
	aside?: ReactNode
}

/**
 * The DOM reads quantity, name, state (the order a screen reader should hear);
 * `order-*` utilities reorder it visually to state, name, quantity.
 */
export function Row({ chip, name, meta, by, checked, done, dated, live, aside }: RowProps) {
	return (
		<li
			className={cn(
				'relative flex items-center gap-[11px] rounded-xl border border-slate-200 bg-white px-[11px] py-[9px]',
				done && 'border-blue-100 bg-[#F7FAFF]',
				live &&
					"after:pointer-events-none after:absolute after:-inset-[3px] after:rounded-[15px] after:border-[1.5px] after:border-violet-600/50 after:content-['']",
			)}
		>
			<span
				className={cn(
					'order-1 inline-flex h-[26px] min-w-[52px] shrink-0 items-center justify-center rounded-md bg-blue-100 px-[7px] font-mono text-[11px] font-semibold text-blue-700 tabular-nums',
					dated && '-order-2',
				)}
			>
				{chip}
			</span>
			<span className='min-w-0 flex-1'>
				<span className='block truncate text-[12.5px] font-bold tracking-[-0.015em] text-slate-900'>{name}</span>
				{meta && <span className='mt-[3px] block font-mono text-[9.5px] text-slate-500'>{meta}</span>}
				{by && <span className='mt-[3px] block text-xs text-slate-500'>{by}</span>}
			</span>
			{aside}
			{checked !== undefined && <Check on={checked} className='-order-1' />}
		</li>
	)
}
