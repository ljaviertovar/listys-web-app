'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

/**
 * Shown instead of the dashboard when any of its data could not be loaded. Rendering the page with what did load would
 * be worse than nothing: a failed request looks exactly like an account with no lists, receipts or sessions.
 */
export function DashboardLoadError() {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	return (
		<div
			role='alert'
			data-testid='dashboard-load-error'
			className='flex flex-col items-start gap-4 rounded-[20px] border border-red-200 bg-red-50 p-5 md:rounded-3xl md:p-8 dark:border-red-500/30 dark:bg-red-500/10'
		>
			<span className='flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'>
				<HugeiconsIcon
					icon={AlertCircleIcon}
					strokeWidth={1.5}
					className='size-6'
				/>
			</span>
			<div className='flex max-w-xl flex-col gap-2'>
				<h1 className='font-display text-2xl leading-[1.16] font-bold tracking-tight'>We couldn’t load your dashboard</h1>
				<p className='text-[15px] leading-[1.6] text-muted-foreground'>
					Something went wrong while fetching your groups, receipts or shopping sessions. Nothing was changed. Check your
					connection and try again.
				</p>
			</div>
			<Button
				onClick={() => startTransition(() => router.refresh())}
				disabled={pending}
				className='h-11 rounded-[12px] px-5 text-sm font-semibold'
				data-testid='dashboard-load-error-retry'
			>
				{pending ? 'Trying again…' : 'Try again'}
			</Button>
		</div>
	)
}
