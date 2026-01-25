import Link from 'next/link'

import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'

interface Props {
	dashboard?: boolean
	activeShopping: {
		id: string
		name: string
	}
}

export default function ActiveShopping({ activeShopping }: Props) {
	return (
		<Card className='border-primary/50 bg-primary/5'>
			<CardContent className='flex justify-between items-center gap-4'>
				<div className='flex gap-4'>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/10'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={1.5}
								className='h-5 w-5 text-primary-foreground'
							/>
						</div>
					</div>
					<div>
						<CardTitle className='text-primary font-medium'>Active Shopping</CardTitle>
						<CardDescription className='text-foreground '>{activeShopping.name}</CardDescription>
					</div>
				</div>
				<Button className='w-fit'>
					<Link href={`/shopping/${activeShopping.id}`}>Continue Shopping</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
