import Link from 'next/link'

import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
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
		<Card className='border-primary/50 bg-primary/10'>
			<CardContent className='flex justify-between items-center gap-4'>
				<div className='flex gap-4'>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
								className='h-4 w-4 text-primary-foreground'
							/>
						</div>
					</div>
					<div>
						<CardTitle className='text-primary font-medium'>Shopping in progress</CardTitle>
						<CardDescription className='text-foreground '>
							{dashboard ? activeShopping?.name : 'Complete your current shopping run before starting a new one.'}
						</CardDescription>
					</div>
				</div>
				{dashboard && (
					<Button className='w-fit'>
						<Link href={`/shopping/${activeShopping?.id}`}>Continue Shopping</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	)
}
