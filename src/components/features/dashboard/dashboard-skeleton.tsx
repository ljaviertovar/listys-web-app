import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils'

// The page ground is #F2F4F7, so the default `bg-muted` placeholder all but disappears: lines and the hero use a slate fill
// that reads on it, and card placeholders are white like the cards that replace them.
const LINE = 'bg-slate-200/80 dark:bg-muted'
const CARD = 'bg-card shadow-[0_0_0_1px_rgba(15,23,42,0.04)] dark:bg-muted'

/**
 * Mirrors the final layout at the same breakpoints, so nothing jumps when the data arrives: the greeting (its Upload
 * button only from `lg`), the hero next to "Up Next" from `lg`, and the three sections, each with its title row above its
 * card (one column on phones, two from `sm`, three from `xl`).
 */
export function DashboardSkeleton() {
	return (
		<div
			data-testid='dashboard-skeleton'
			role='status'
			aria-busy='true'
			className='flex flex-col gap-6 pt-1 md:gap-8 md:pt-0 lg:-mt-3 lg:gap-9'
		>
			<span className='sr-only'>Loading your dashboard</span>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-2'>
					<Skeleton className={cn('h-7 w-44 rounded-lg', LINE)} />
					<Skeleton className={cn('h-9 w-72 max-w-full rounded-lg', LINE)} />
					<Skeleton className={cn('h-5 w-full max-w-md rounded-lg', LINE)} />
				</div>
				<Skeleton className={cn('hidden h-11 w-44 rounded-xl lg:block', LINE)} />
			</div>

			<div className='grid items-stretch gap-6 lg:grid-cols-5'>
				<Skeleton className={cn('h-[360px] rounded-3xl lg:col-span-3', LINE)} />
				<div className='flex flex-col gap-3 lg:col-span-2'>
					<div className='flex min-h-10 items-center'>
						<Skeleton className={cn('h-5 w-24 rounded-lg', LINE)} />
					</div>
					<Skeleton className={cn('h-[200px] rounded-3xl', CARD)} />
				</div>
			</div>

			<div className='grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3'>
				{['', '', 'sm:col-span-2 xl:col-span-1'].map((span, i) => (
					<div
						key={i}
						className={cn('flex flex-col gap-3', span)}
					>
						<div className='flex min-h-8 items-center md:min-h-10'>
							<Skeleton className={cn('h-5 w-40 rounded-lg', LINE)} />
						</div>
						<Skeleton className={cn('h-[260px] rounded-3xl', CARD)} />
					</div>
				))}
			</div>
		</div>
	)
}
