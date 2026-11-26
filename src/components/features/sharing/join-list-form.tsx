'use client'

import { useActionState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { acceptInviteAction } from '@/actions/sharing'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/** The one decision of the invite screen: nobody joins a list until they press the button. */
export function JoinListForm({ token }: { token: string }) {
	const [state, action, pending] = useActionState(acceptInviteAction, { error: null })

	return (
		<form
			data-testid='join-list-form'
			action={action}
			className='flex flex-col gap-3'
		>
			<input
				type='hidden'
				name='token'
				value={token}
			/>
			{state.error ? (
				<Alert
					variant='destructive'
					data-testid='join-list-error'
				>
					<HugeiconsIcon
						icon={AlertCircleIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					<AlertDescription>{state.error}</AlertDescription>
				</Alert>
			) : null}
			<Button
				type='submit'
				variant='cta'
				size='xl'
				disabled={pending}
				aria-busy={pending}
				className='w-full'
			>
				{pending ? (
					<>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='animate-spin motion-reduce:animate-none'
						/>
						Joining…
					</>
				) : (
					'Join shared list'
				)}
			</Button>
		</form>
	)
}
