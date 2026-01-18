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
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { cancelShoppingRun } from '@/actions/shopping-runs'

interface Props {
	runId: string
}

export function CancelRunButton({ runId }: Props) {
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const handleCancel = async () => {
		setLoading(true)
		try {
			const { error } = await cancelShoppingRun(runId)
			if (error) throw new Error(error)
			router.push('/dashboard')
		} catch (err) {
			console.error('Failed to cancel run:', err)
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
					variant='ghost'
					size='sm'
					className='text-destructive hover:bg-destructive/10 hover:text-destructive'
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={2}
						className='mr-2 h-4 w-4'
					/>
					Cancel Run
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel Shopping Run?</AlertDialogTitle>
					<AlertDialogDescription>
						This will discard this shopping run entirely. It will not be saved to your history. This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep Shopping</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleCancel}
						disabled={loading}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{loading ? 'Canceling...' : 'Discard Run'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
