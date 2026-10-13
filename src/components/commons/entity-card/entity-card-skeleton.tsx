import { Skeleton } from '@/components/ui/skeleton'
import { CARD_SURFACE } from '@/components/app/helpers/a1-surface'
import { cn } from '@/utils'

/** The shape of an `EntityCard` while its screen loads: tile, two lines and the footer, so nothing jumps when the cards arrive. */
export function EntityCardSkeleton({ testId }: { testId: string }) {
	return (
		<div
			data-testid={testId}
			aria-hidden='true'
			className={cn('flex flex-col gap-3 p-4', CARD_SURFACE)}
		>
			<div className='flex items-center gap-3'>
				<Skeleton className='size-9 rounded-[12px]' />
				<div className='flex flex-1 flex-col gap-2'>
					<Skeleton className='h-3.5 w-1/2 rounded-md' />
					<Skeleton className='h-3 w-4/5 rounded-md' />
				</div>
			</div>
			<div className='flex items-center justify-between border-t border-slate-100 pt-3 dark:border-border'>
				<Skeleton className='h-3 w-14 rounded-md' />
				<Skeleton className='h-3 w-20 rounded-md' />
			</div>
		</div>
	)
}
