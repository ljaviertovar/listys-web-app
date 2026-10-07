import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mirrors the final layout (greeting with its Upload button, hero, three section cards) at the same breakpoints, so
 * nothing jumps when the data arrives: one column on phones, two from `sm`, three from `xl`.
 */
export function DashboardSkeleton() {
	return (
		<div
			data-testid='dashboard-skeleton'
			aria-busy='true'
			className='flex flex-col gap-6 md:gap-8'
		>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-8 w-44 rounded-full' />
					<Skeleton className='h-9 w-72 max-w-full' />
					<Skeleton className='h-6 w-full max-w-md' />
				</div>
				<Skeleton className='h-11 w-full rounded-[12px] sm:w-44' />
			</div>
			<Skeleton className='h-[440px] rounded-3xl md:h-[330px]' />
			<div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton
						key={i}
						className='h-80 rounded-[20px] md:rounded-3xl'
					/>
				))}
			</div>
		</div>
	)
}
