'use client'

import { useState } from 'react'
import { CompleteSessionButton } from './complete-session-button'
import { CompleteSessionAlert } from './complete-session-alert'
import { CancelSessionButton } from './cancel-session-button'
import { AddItemDialogBaseList } from '@/components/app/add-item-dialog-base-list'

interface Props {
	sessionId: string
	progress: number
}

export function ShoppingSessionActions({ sessionId, progress }: Props) {
	const [alertOpen, setAlertOpen] = useState(false)

	return (
		<>
			<div className='flex flex-col items-center gap-3 w-full'>
				<div className='flex items-center gap-2 w-full sm:w-auto flex-1'>
					<CancelSessionButton sessionId={sessionId} />
					<CompleteSessionButton onOpenAlert={() => setAlertOpen(true)} />
				</div>

				<div className='w-full shrink-0'>
					<AddItemDialogBaseList
						context='shopping-session'
						sessionId={sessionId}
					/>
				</div>
			</div>

			<CompleteSessionAlert
				title={progress === 100 ? '🎉 All items checked!' : 'Complete Shopping Session?'}
				description={
					progress === 100
						? 'You have checked all items in your shopping list. Would you like to complete this shopping session?'
						: 'You still have unchecked items. Are you sure you want to complete this shopping session?'
				}
				sessionId={sessionId}
				progress={progress}
				open={alertOpen}
				onOpenChange={setAlertOpen}
			/>
		</>
	)
}
