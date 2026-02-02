'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

import { completeShoppingSession, getShoppingSession } from '@/actions/shopping-sessions'
import type { ShoppingSessionItem } from '@/features/shopping-sessions/types'
import { CompleteSessionAlert } from './complete-session-alert'

interface Props {
	sessionId: string
	items?: ShoppingSessionItem[]
	progress: number
}

export function CompleteSessionButton({ sessionId, items: propItems, progress }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [syncToBase, setSyncToBase] = useState(true)
	const [items, setItems] = useState<ShoppingSessionItem[]>(propItems || [])
	const router = useRouter()

	useEffect(() => {
		if (!propItems) {
			const loadItems = async () => {
				const { data } = await getShoppingSession(sessionId)
				if (data?.items) {
					setItems(data.items)
				}
			}
			loadItems()
		}
	}, [sessionId, propItems])

	const handleButtonClick = () => {
		setOpen(true)
	}

	const handleComplete = async () => {
		setLoading(true)
		try {
			const { error } = await completeShoppingSession(sessionId, {
				sync_to_base: syncToBase,
			})
			if (error) throw new Error(error)
			setOpen(false)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete session:', err)
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
				<CompleteSessionAlert
					title={progress === 100 ? '🎉 All items checked!' : 'Complete Shopping Session?'}
					description={
						progress === 100
							? 'You have checked all items in your shopping list. Would you like to complete this shopping session?'
							: 'You still have unchecked items. Are you sure you want to complete this shopping session?'
					}
					sessionId={sessionId}
					progress={progress}
				/>
			)}
		</>
	)
}
