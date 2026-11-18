import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { MonthSpendingSkeleton } from './month-spending-card'

/** Mirrors the dashboard's order and responsive grid while its server data is loading. */
export function DashboardSkeleton() {
	return (
		<div
			data-testid='dashboard-skeleton'
			role='status'
			aria-busy='true'
			className='flex flex-col gap-6 pt-1 md:gap-8 md:pt-0 lg:-mt-3 lg:gap-9'
		>
			<span className='sr-only'>Loading your dashboard</span>
			<Card size='spending' className='mb-[-8px]'>
				<MonthSpendingSkeleton testId='dashboard-month-spending-skeleton' />
			</Card>

			<div className='grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5'>
				<div
					data-testid='dashboard-activity-skeleton'
					aria-hidden='true'
					className='flex min-h-100 flex-col justify-end gap-4 overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-sm md:min-h-112 md:p-8 lg:col-span-3'
				>
					<Skeleton className='h-6 w-36 rounded-full bg-white/20' />
					<Skeleton className='h-8 w-3/4 max-w-sm bg-white/20' />
					<Skeleton className='h-4 w-full max-w-lg bg-white/20' />
					<Skeleton className='h-11 w-40 rounded-xl bg-white/20' />
				</div>
				<section className='flex flex-col gap-2.5 lg:col-span-2' aria-hidden='true'>
					<div className='flex min-h-8 items-center justify-between gap-3'>
						<Skeleton className='h-5 w-24' />
						<Skeleton className='h-3.5 w-20' />
					</div>
					<Card size='flush'>
						<CardContent inset='compact' space='snug'>
							{[0, 1].map(row => (
								<div key={row} className='flex min-h-16 items-center gap-3 rounded-2xl bg-muted/70 px-3 py-2.5'>
									<Skeleton className='size-12 shrink-0 rounded-2xl' />
									<div className='flex min-w-0 flex-1 flex-col gap-2'>
										<Skeleton className='h-3.5 w-3/4' />
										<Skeleton className='h-3 w-1/2' />
									</div>
									<Skeleton className='size-4 shrink-0' />
								</div>
							))}
						</CardContent>
					</Card>
				</section>
			</div>

			<div className='grid grid-cols-1 items-stretch gap-5 max-sm:-mt-1.5 max-sm:gap-4 sm:grid-cols-2 2xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<Card
						key={index}
						data-testid={`dashboard-section-skeleton-${index}`}
						aria-hidden='true'
						size='dashboard'
						className={index === 2 ? 'sm:col-span-2 2xl:col-span-1' : undefined}
					>
						<div className='flex min-h-10 items-center gap-3 px-2'>
							<Skeleton className='h-5 w-32 min-w-0 flex-1' />
							<Skeleton className='h-4 w-16' />
						</div>
						<div className='flex flex-1 flex-col gap-1'>
							{[0, 1, 2].map(row => (
								<div key={row} className='flex min-h-14 items-center gap-2.5 rounded-2xl bg-muted/70 p-2'>
									<Skeleton className='size-10 shrink-0 rounded-2xl' />
									<div className='flex min-w-0 flex-1 flex-col gap-2'>
										<Skeleton className='h-3.5 w-3/4' />
										<Skeleton className='h-3 w-1/2' />
									</div>
									<Skeleton className='h-8 w-16 rounded-xl' />
								</div>
							))}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}
