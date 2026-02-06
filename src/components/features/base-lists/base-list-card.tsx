'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListViewIcon, ShoppingCart02Icon, Edit02Icon, Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { deleteBaseList } from '@/actions/base-lists'
import { createShoppingSession } from '@/actions/shopping-sessions'

import type { BaseListWithCount } from '@/features/base-lists/types'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ActiveShoppingBadge } from '@/components/app/active-shopping-badge'
import { StartShoppingDialog } from '@/components/features/base-lists/start-shopping-dialog'

interface Props {
	baseList: BaseListWithCount
	hasActiveRun?: boolean
	isActiveRun?: boolean
	activeRunId?: string
}

export function BaseListCard({ baseList, hasActiveRun = false, isActiveRun = false, activeRunId }: Props) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [loading, setLoading] = useState(false)
	const [startingRun, setStartingRun] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setLoading(true)
		try {
			const { error } = await deleteBaseList(baseList.id)
			if (error) throw new Error(error)
			router.refresh()
		} catch (err) {
			console.error('Failed to delete list:', err)
		} finally {
			setLoading(false)
			setShowDeleteDialog(false)
		}
	}

	const handleStartRun = async () => {
		setStartingRun(true)
		try {
			// Prevent starting from an empty base list
			if (!baseList.items_count || baseList.items_count === 0) {
				toast.error('Cannot start a shopping session from an empty base list. Add items first.')
				setStartingRun(false)
				return
			}
			const result = await createShoppingSession({
				base_list_id: baseList.id,
				name: baseList.name,
			})

			// If there's an active session, redirect to it
			if (result.error) {
				const resultWithId = result as { error: string; activeRunId?: string }
				if (resultWithId.activeRunId) {
					router.push(`/shopping/${resultWithId.activeRunId}`)
					return
				}
				// Show error message to user
				toast.error('Cannot start shopping session', {
					description: result.error,
				})
				return
			}

			if (!result.data) throw new Error('Failed to create shopping session')

			router.push(`/shopping/${result.data.id}`)
		} catch (err) {
			console.error('Failed to start shopping session:', err)
			toast.error('Error', {
				description: 'Failed to start shopping session. Please try again.',
			})
		} finally {
			setStartingRun(false)
		}
	}

	const isDisabled = hasActiveRun && !isActiveRun

	return (
		<>
			<Card
				className={`hover:border-primary/50 transition-colors gap-2`}
				size='sm'
			>
				<CardHeader className='gap-0'>
					<div className='flex items-center justify-end gap-1'>
						{isActiveRun && <ActiveShoppingBadge />}
						{!isActiveRun && (
							<>
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
								<Button
									variant='ghost'
									size='icon'
									onClick={e => {
										e.preventDefault()
										e.stopPropagation()
										setShowDeleteDialog(true)
									}}
									disabled={loading}
									className='h-8 w-8'
								>
									<HugeiconsIcon
										icon={Delete02Icon}
										strokeWidth={2}
									/>
								</Button>
							</>
						)}
					</div>
					<div className='flex gap-2 items-center'>
						<span className='h-10 w-10 bg-primary/10 flex justify-center items-center rounded-lg'>
							<HugeiconsIcon
								icon={ListViewIcon}
								strokeWidth={2}
								className='h-5 w-5 text-primary'
							/>
						</span>
						<div className='flex flex-col flex-1 min-w-0'>
							<CardTitle className='text-base md:text-lg truncate w-full max-w-[25ch] md:max-w-[20ch]'>
								{baseList.name}
							</CardTitle>
						</div>
					</div>
				</CardHeader>
				<CardFooter className='justify-between items-center'>
					<span>
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
						<div className='w-6/12'>
							<StartShoppingDialog
								baseListId={baseList.id}
								baseListName={baseList.name}
								disabled={isDisabled || startingRun || loading}
								itemsCount={baseList.items_count}
							/>
						</div>
					)}
				</CardFooter>
			</Card>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent size='sm'>
					<AlertDialogHeader>
						<AlertDialogMedia className='rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={2}
								className='h-4 w-4'
							/>
						</AlertDialogMedia>
						<AlertDialogTitle>Delete Base List?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the Base List and all its items. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							variant={'outline'}
							size={'sm'}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={loading}
							variant={'destructive'}
							size={'sm'}
							className='flex-1'
						>
							{loading ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										className='h-4 w-4 animate-spin'
									/>
									Deleting...
								</>
							) : (
								'Delete'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
