import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'

import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

interface Props {
	dashboard?: boolean
	activeShopping?: {
		id: string
		name: string
		items?: Array<{ checked: boolean | null }>
	}
}

export default function ActiveShopping({ activeShopping, dashboard }: Props) {
	// Calculate progress
	const totalItems = activeShopping?.items?.length ?? 0
	const checkedItems = activeShopping?.items?.filter(item => item.checked === true).length ?? 0
	const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

	return (
		<Alert className='border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'>
			<div className='flex justify-between items-center gap-4 flex-col md:flex-row w-full'>
				<div className='flex gap-4 w-full'>
					<div className='relative flex h-12 w-12 min-w-12 items-center justify-center rounded-xl bg-green-500/20'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 shadow-sm'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
								className='h-4 w-4 text-white'
							/>
						</div>
						<span className='absolute -top-1 -right-1 flex h-3 w-3'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
							<span className='relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-green-50 shadow-sm'></span>
						</span>
					</div>
					<div className='flex flex-col justify-center gap-2 flex-1'>
						<div>
							<AlertTitle className='text-green-800 dark:text-green-300 font-bold'>Shopping in progress</AlertTitle>
							<AlertDescription className='text-green-700/80 dark:text-green-400/80'>
								{dashboard ? activeShopping?.name : 'Complete your current shopping session before starting a new one.'}
							</AlertDescription>
						</div>
						{totalItems > 0 && (
							<div className='flex flex-col gap-1.5'>
								<div className='flex items-center justify-between text-xs'>
									<span className='text-green-700/70 dark:text-green-400/70 font-medium'>
										{checkedItems} of {totalItems} items
									</span>
									<span className='text-green-800 dark:text-green-300 font-semibold'>{progress}%</span>
								</div>
								<Progress
									value={progress}
									className='h-2 bg-green-200/50 dark:bg-green-900/30'
									indicatorClassName='bg-green-600 dark:bg-green-500'
								/>
							</div>
						)}
					</div>
				</div>

				<Button
					size={'sm'}
					asChild
					className='bg-green-600 hover:bg-green-700 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-md border-none ml-auto md:ml-0'
				>
					<Link href={`/shopping/${activeShopping?.id}`}>Continue Shopping</Link>
				</Button>
			</div>
		</Alert>
	)
}
