'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { requestPantrySetup } from './helpers/request-pantry-setup'

interface SetUpPantryActionProps {
	/** The caller names where it is shown; the button's own id is derived from it. */
	testId: string
}

/** The "Set up Pantry" action: one request at a time, and busy until the refreshed page replaces whatever offered it. */
export function SetUpPantryAction({ testId }: SetUpPantryActionProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isRefreshing, startRefresh] = useTransition()
	// Stays busy until the refreshed page replaces this notice, so a second press cannot start another request.
	const pending = isSubmitting || isRefreshing

	const handleSetUp = async () => {
		if (pending) return
		setIsSubmitting(true)

		const result = await requestPantrySetup()
		if (!result.ok) {
			toast.error(result.message)
			setIsSubmitting(false)
			return
		}

		toast.success(result.message)
		startRefresh(() => router.refresh())
		setIsSubmitting(false)
	}

	return (
		<Button
			size='lg'
			className='w-full sm:w-auto'
			disabled={pending}
			onClick={handleSetUp}
			data-testid={`${testId}-button`}
		>
			{pending ? 'Setting up…' : 'Set up Pantry'}
		</Button>
	)
}
