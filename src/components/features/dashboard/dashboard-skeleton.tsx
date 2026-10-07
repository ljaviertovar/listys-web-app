import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors the final layout (greeting, hero, three section cards) so nothing jumps when the data arrives. */
export function DashboardSkeleton() {
	return (
		<div
			data-testid='dashboard-skeleton'
			aria-busy='true'
			className='flex flex-col gap-6'
		>
			<div className='flex flex-col gap-3'>
				<Skeleton className='h-7 w-44 rounded-full' />
				<Skeleton className='h-9 w-3/4' />
				<Skeleton className='h-5 w-full max-w-md' />
			</div>
			<Skeleton className='h-[330px] rounded-3xl' />
			<div className='grid gap-5 lg:grid-cols-3'>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton
						key={i}
						className='h-80 rounded-3xl'
					/>
				))}
			</div>
		</div>
	)
}
