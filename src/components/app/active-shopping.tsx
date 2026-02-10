import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'

import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

interface Props {
	dashboard?: boolean
	activeShopping?: {
		id: string
		name: string
	}
}

export default function ActiveShopping({ activeShopping, dashboard }: Props) {
	return (
		<Alert variant='info'>
			<div className='flex justify-between items-center gap-4 flex-col md:flex-row'>
				<div className='flex gap-4'>
					<div className='flex h-12 w-12 min-w-12 items-center justify-center rounded-xl bg-blue-500/20'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
								className='h-4 w-4 text-primary-foreground'
							/>
						</div>
					</div>
					<div>
						<AlertTitle>Shopping in progress</AlertTitle>
						<AlertDescription>
							{dashboard ? activeShopping?.name : 'Complete your current shopping session before starting a new one.'}
						</AlertDescription>
					</div>
				</div>
				<Button
					size={'xs'}
					asChild
					variant='outline'
				>
					<Link href={`/shopping/${activeShopping?.id}`}>Continue Shopping</Link>
				</Button>
			</div>
		</Alert>
	)
}
