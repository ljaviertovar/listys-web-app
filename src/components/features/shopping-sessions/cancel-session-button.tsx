'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { cancelShoppingSession } from '@/actions/shopping-sessions'
import { useActiveSessionStore } from '@/stores/active-session'

interface Props {
	sessionId: string
}

export function CancelSessionButton({ sessionId }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const router = useRouter()
	const clearActiveSession = useActiveSessionStore(s => s.clearActiveSession)

	const handleCancel = async () => {
		setLoading(true)
		try {
			const { error } = await cancelShoppingSession(sessionId)
			if (error) throw new Error(error)
			// Clear store optimistically
			clearActiveSession()
			router.push('/dashboard')
		} catch (err) {
			console.error('Failed to cancel session:', err)
			setLoading(false)
			setOpen(false)
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<AlertDialogTrigger asChild>
				<Button
					variant='link'
					size='sm'
					className='flex-1'
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={2}
						className='h-4 w-4'
					/>
					Cancel Shopping
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size='sm'>
				<AlertDialogHeader>
					<AlertDialogMedia className='rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
						<HugeiconsIcon
							icon={Delete02Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
					</AlertDialogMedia>
					<AlertDialogTitle>Cancel Shopping?</AlertDialogTitle>
					<AlertDialogDescription>
						This will discard this shopping entirely. It will not be saved to your history. This action cannot be undone
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant='outline'>Keep Shopping</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleCancel}
						disabled={loading}
						variant={'destructive'}
						className='flex-1'
					>
						{loading ? (
							<>
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className='h-4 w-4 animate-spin'
								/>
								Cancelling...
							</>
						) : (
							'Cancel Shopping'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
