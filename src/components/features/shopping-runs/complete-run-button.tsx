'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

import { completeShoppingRun, getShoppingRun } from '@/actions/shopping-runs'
import type { ShoppingRunItem } from '@/features/shopping-runs/types'
import { CompleteRunAlert } from './complete-run-alert'

interface Props {
	runId: string
	items?: ShoppingRunItem[]
	progress: number
}

export function CompleteRunButton({ runId, items: propItems, progress }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const [items, setItems] = useState<ShoppingRunItem[]>(propItems || [])
	const router = useRouter()

	useEffect(() => {
		if (!propItems) {
			const loadItems = async () => {
				const { data } = await getShoppingRun(runId)
				if (data?.items) {
					setItems(data.items)
				}
			}
			loadItems()
		}
	}, [runId, propItems])

	const handleButtonClick = () => {
		setOpen(true)
	}

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingRun(runId, {
				sync_to_base: syncToBase,
			})
			if (error) throw new Error(error)
			setOpen(false)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete run:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<Button
				onClick={handleButtonClick}
				disabled={loading}
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

			{open && (
				<CompleteRunAlert
					title={progress === 100 ? '🎉 All items checked!' : 'Complete Shopping Run?!'}
					description={
						progress === 100
							? 'You have checked all items in your shopping list. Would you like to complete this shopping run?'
							: 'You still have unchecked items. Are you sure you want to complete this shopping run?'
					}
					runId={runId}
					progress={progress}
				/>
			)}
		</>
	)
}
