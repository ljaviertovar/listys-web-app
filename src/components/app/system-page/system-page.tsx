import type { ComponentProps, ReactNode, Ref } from 'react'

import { LogoMark } from '@/components/commons/logo'
import { cn } from '@/utils'

interface SystemPageProps extends Omit<ComponentProps<'div'>, 'title'> {
	testId: string
	/** The page owns the whole viewport and shows the Listys lockup; inside the app the top bar already shows the mark. */
	fullScreen?: boolean
	paper: ReactNode
	title?: ReactNode
	titleRef?: Ref<HTMLHeadingElement>
	description?: ReactNode
	actions?: ReactNode
	/** Classes of the group under the ground, for the delayed reveal of the loading screen. */
	contentClassName?: string
}

/**
 * The page behind loading, error and not found: the page ground, the lockup, the receipt paper that tells which of the three
 * it is, then an optional title, line and actions. The three share it so a system page always looks like the same receipt.
 */
export function SystemPage({
	testId,
	fullScreen = false,
	paper,
	title,
	titleRef,
	description,
	actions,
	contentClassName,
	className,
	children,
	...rest
}: SystemPageProps) {
	return (
		<div
			data-testid={testId}
			{...rest}
			className={cn(
				'flex items-center justify-center px-4 py-8',
				fullScreen ? 'min-h-dvh bg-muted dark:bg-sidebar' : 'min-h-full',
				className,
			)}
		>
			<div className={cn('flex w-full max-w-sm flex-col items-center text-center', contentClassName)}>
				{fullScreen ? (
					<div
						data-testid={`${testId}-lockup`}
						className='flex flex-col items-center gap-3'
					>
						<LogoMark className='size-10' />
						<span className='text-xl leading-7 font-bold tracking-tight'>Listys</span>
					</div>
				) : null}
				<div className={cn(fullScreen && 'mt-5.5')}>{paper}</div>
				{title ? (
					<h1
						ref={titleRef}
						tabIndex={titleRef ? -1 : undefined}
						className='mt-8 text-2xl leading-8 font-bold tracking-tight outline-none'
					>
						{title}
					</h1>
				) : null}
				{description ? <p className='mt-2 max-w-75 text-base text-muted-foreground'>{description}</p> : null}
				{actions ? <div className='mt-6 flex w-full flex-col gap-3'>{actions}</div> : null}
				{children}
			</div>
		</div>
	)
}
