'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

interface Props {
	onOpenAlert: () => void
}

export function CompleteSessionButton({ onOpenAlert }: Props) {
	return (
		<Button
			onClick={onOpenAlert}
			size='sm'
			variant={'ghost'}
			className='flex-1'
		>
			<HugeiconsIcon
				icon={Tick02Icon}
				strokeWidth={2}
				className='h-4 w-4'
			/>
			Complete Shopping
		</Button>
	)
}
