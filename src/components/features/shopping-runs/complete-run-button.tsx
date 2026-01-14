'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { completeShoppingRun } from '@/actions/shopping-runs'

interface Props {
	runId: string
}

export function CompleteRunButton({ runId }: Props) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleComplete = async () => {
		if (!confirm('Mark this shopping run as complete?')) return

		setLoading(true)
		try {
			const { error } = await completeShoppingRun(runId, {
				sync_to_base: false,
			})
			if (error) throw new Error(error)
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			console.error('Failed to complete run:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button
			onClick={handleComplete}
			disabled={loading}
			size='sm'
			variant={'secondary'}
		>
			<HugeiconsIcon
				icon={Tick02Icon}
				strokeWidth={2}
				data-icon='inline-start'
			/>
			{loading ? 'Completing...' : 'Complete'}
		</Button>
	)
}
