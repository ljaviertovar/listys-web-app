'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { File01Icon, ShoppingCart02Icon, Edit02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { deleteBaseList } from '@/actions/base-lists'
import { createShoppingRun } from '@/actions/shopping-runs'
import { formatDate } from '@/utils/format-date'
import { toast } from 'sonner'
import Link from 'next/link'
import type { BaseListWithCount } from '@/features/base-lists/types'

interface Props {
	baseList: BaseListWithCount
	hasActiveRun?: boolean
	isActiveRun?: boolean
	activeRunId?: string
}

export function BaseListCard({ baseList, hasActiveRun = false, isActiveRun = false, activeRunId }: Props) {
	const [loading, setLoading] = useState(false)
	const [startingRun, setStartingRun] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this list?')) return

		setLoading(true)
		try {
			const { error } = await deleteBaseList(baseList.id)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to delete list:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleStartRun = async () => {
		setStartingRun(true)
		try {
			const result = await createShoppingRun({
				base_list_id: baseList.id,
				name: baseList.name,
			})

			// If there's an active run, redirect to it
			if (result.error) {
				const resultWithId = result as { error: string; activeRunId?: string }
				if (resultWithId.activeRunId) {
					router.push(`/shopping/${resultWithId.activeRunId}`)
					return
				}
				// Show error message to user
				toast.error('Cannot start shopping run', {
					description: result.error,
				})
				return
			}

			if (!result.data) throw new Error('Failed to create shopping run')

			router.push(`/shopping/${result.data.id}`)
		} catch (err) {
			console.error('Failed to start shopping run:', err)
			toast.error('Error', {
				description: 'Failed to start shopping run. Please try again.',
			})
		} finally {
			setStartingRun(false)
		}
	}

	return (
		<Card className={`hover:border-primary/50 transition-colors`}>
			<CardHeader className='gap-0'>
				<div className='flex items-center justify-end gap-1'>
					{isActiveRun && (
						<div className='h-8 align-middle'>
							<Badge className='bg-green-100 text-green-500 flex items-center gap-1.5'>
								<span className='h-2 w-2 rounded-full bg-green-500' />
								Shopping
							</Badge>
						</div>
					)}
					{!isActiveRun && (
						<>
							<Button
								variant='ghost'
								size='icon'
								onClick={handleDelete}
								disabled={loading}
								className='h-8 w-8'
							>
								<HugeiconsIcon
									icon={Delete02Icon}
									strokeWidth={2}
									className='h-4 w-4'
								/>
							</Button>
							<Button
								variant='ghost'
								size='icon'
								asChild
								className='h-8 w-8'
							>
								<Link href={`/base-lists/${baseList.id}/edit`}>
									<HugeiconsIcon
										icon={Edit02Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
								</Link>
							</Button>
						</>
					)}
				</div>
				<div className='flex gap-2 items-center'>
					<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-full'>
						<HugeiconsIcon
							icon={File01Icon}
							strokeWidth={2}
							className='h-6 w-6 text-primary'
						/>
					</span>
					<div className='flex flex-col'>
						<CardTitle className='text-lg'>{baseList.name}</CardTitle>
					</div>
				</div>
			</CardHeader>
			<CardFooter className='justify-between items-center'>
				<span className='font-medium text-primary'>
					{baseList.items_count} {baseList.items_count === 1 ? 'item' : 'items'}
				</span>
				{isActiveRun ? (
					<Button
						variant={'outline'}
						size={'sm'}
						asChild
					>
						<Link href={`/shopping/${activeRunId}`}>
							<HugeiconsIcon
								icon={ShoppingCart02Icon}
								strokeWidth={2}
								data-icon='inline-start'
							/>
							Continue Shopping
						</Link>
					</Button>
				) : (
					<Button
						variant={'outline'}
						size={'sm'}
						onClick={handleStartRun}
						disabled={startingRun || loading || hasActiveRun}
					>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={2}
							data-icon='inline-start'
						/>
						{startingRun ? 'Starting...' : 'Start Shopping'}
					</Button>
				)}
			</CardFooter>
		</Card>
	)
}
