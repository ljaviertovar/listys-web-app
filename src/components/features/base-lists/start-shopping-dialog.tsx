'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingCart02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { createShoppingSession } from '@/lib/api/endpoints/shopping-sessions'
import { toast } from 'sonner'
import { AlertDialogMedia } from '@/components/ui/alert-dialog'
import useActiveSessionStore from '@/stores/active-session'

interface Props {
	baseListId: string
	baseListName?: string
	disabled?: boolean
	itemsCount?: number
}

export function StartShoppingDialog({ baseListId, baseListName, disabled, itemsCount }: Props) {
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const setActiveSession = useActiveSessionStore(s => s.setActiveSession)

	const handleConfirm = async () => {
		setLoading(true)
		try {
			const { data, error, activeSessionId } = await createShoppingSession({
				base_list_id: baseListId,
				name: baseListName || '',
			})
			if (error) {
				// If there's an active session, navigate to it
				if ((error as string).includes('active shopping run') && activeSessionId) {
					router.push(`/shopping/${activeSessionId}`)
					return
				}
				throw new Error(error as string)
			}

			if (data?.id) {
				// Update store optimistically
				setActiveSession({ id: data.id, name: data.name })
				router.push(`/shopping/${data.id}`)
				// Keep modal open with spinner until navigation completes
			} else {
				router.refresh()
				setLoading(false)
				setOpen(false)
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to start shopping session'
			toast.error(message)
			setLoading(false)
			setOpen(false)
		}
	}

	const isEmpty = itemsCount !== undefined ? itemsCount === 0 : false

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					disabled={disabled || isEmpty}
					className='w-full'
					size={'sm'}
					data-testid='start-shopping-button'
				>
					<HugeiconsIcon
						icon={ShoppingCart02Icon}
						strokeWidth={2}
						data-icon='inline-start'
					/>
					Start Shopping
				</Button>
			</DialogTrigger>
			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12'
			>
				<DialogHeader className='items-center gap-1.5'>
					<AlertDialogMedia className='rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'>
						<HugeiconsIcon
							icon={ShoppingCart02Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
					</AlertDialogMedia>
					<DialogTitle>Start Shopping Session</DialogTitle>
					<DialogDescription>
						{isEmpty ? (
							'This base list has no items. Add items before starting a shopping session.'
						) : (
							<>
								This will create a new shopping session using items from the base list
								{baseListName ? ` "${baseListName}"` : ''}.
							</>
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='w-full flex-row justify-between gap-4'>
					<Button
						variant='outline'
						onClick={() => setOpen(false)}
						disabled={loading}
						className='flex-1'
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={loading || isEmpty}
						className='flex-1'
						data-testid='confirm-start-shopping'
					>
						{loading ? (
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={2}
								className='h-4 w-4 animate-spin'
							/>
						) : null}
						{loading ? 'Starting…' : 'Start Shopping'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
