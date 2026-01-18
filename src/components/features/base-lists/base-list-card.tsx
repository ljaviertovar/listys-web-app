'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { File01Icon, ShoppingCart02Icon, Edit02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { deleteBaseList } from '@/actions/base-lists'
import { createShoppingRun } from '@/actions/shopping-runs'
import { formatDate } from '@/utils/format-date'
import Link from 'next/link'
import type { BaseListWithCount } from '@/features/base-lists/types'

interface Props {
	baseList: BaseListWithCount
	hasActiveRun?: boolean
}

export function BaseListCard({ baseList, hasActiveRun = false }: Props) {
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
			const runName = `${baseList.name} - ${formatDate(new Date())}`
			const result = await createShoppingRun({
				base_list_id: baseList.id,
				name: runName,
			})

			// If there's an active run, redirect to it
			if (result.error) {
				const resultWithId = result as { error: string; activeRunId?: string }
				if (resultWithId.activeRunId) {
					router.push(`/shopping/${resultWithId.activeRunId}`)
					return
				}
				throw new Error(result.error)
			}

			if (!result.data) throw new Error('Failed to create shopping run')

			router.push(`/shopping/${result.data.id}`)
		} catch (err) {
			console.error('Failed to start shopping run:', err)
			alert('Failed to start shopping run. Please try again.')
		} finally {
			setStartingRun(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span className='flex items-center gap-2'>
						<HugeiconsIcon
							icon={File01Icon}
							strokeWidth={2}
						/>
						{baseList.name}
					</span>
					<div className='flex gap-1'>
						<Button
							variant='ghost'
							size='icon'
							asChild
						>
							<Link href={`/base-lists/${baseList.id}/edit`}>
								<HugeiconsIcon
									icon={Edit02Icon}
									strokeWidth={2}
								/>
							</Link>
						</Button>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleDelete}
							disabled={loading}
						>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
							/>
						</Button>
					</div>
				</CardTitle>
				{baseList.items_count > 0 && (
					<CardDescription>
						<Badge variant='secondary'>{baseList.items_count} items</Badge>
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className='space-y-2'>
				<Button
					className='w-full'
					onClick={handleStartRun}
					disabled={startingRun || loading || hasActiveRun}
				>
					<HugeiconsIcon
						icon={ShoppingCart02Icon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					{startingRun ? 'Starting...' : 'Start Shopping Run'}
				</Button>
				{hasActiveRun && (
					<p className='text-xs text-center text-muted-foreground'>Complete your current shopping run first</p>
				)}
			</CardContent>
		</Card>
	)
}
