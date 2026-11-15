import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface EntityCardSkeletonProps {
	testId: string
	kind: 'list' | 'store'
}

/** Mirrors the list and store card shells, with the content slots each kind actually uses. */
export function EntityCardSkeleton({ testId, kind }: EntityCardSkeletonProps) {
	return (
		<Card data-testid={testId} aria-hidden='true' size='list'>
			<div className='flex items-center gap-3'>
				<Skeleton className='h-5 min-w-0 flex-1' />
				<Skeleton className='size-10 shrink-0 rounded-xl' />
			</div>
			{kind === 'list' ? (
				<div className='flex flex-col gap-2'>
					<div className='flex items-start gap-1.5'>
						<Skeleton className='mt-0.5 size-4 shrink-0 rounded-sm' />
						<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
							<Skeleton className='h-3.5 w-4/5' />
							<Skeleton className='h-3.5 w-3/5' />
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-5 w-16 rounded-full' />
						<Skeleton className='h-4 w-2/5' />
					</div>
				</div>
			) : (
				<div className='flex items-center gap-2'>
					<Skeleton className='h-5 w-12 rounded-full' />
					<Skeleton className='h-4 w-2/5' />
				</div>
			)}
			<div className='flex min-h-10 items-center justify-between gap-3 border-t border-border pt-3'>
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-4 w-20' />
			</div>
		</Card>
	)
}
