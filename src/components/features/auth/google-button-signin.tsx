'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

import { GoogleGlyph } from './google-glyph'

interface Props {
	typeSubmit: 'signin' | 'signup'
	callbackUrl?: string
	/** The email form is submitting: both ways in wait for it. */
	disabled?: boolean
}

export default function GoogleButtonSignin({ typeSubmit, callbackUrl, disabled = false }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const supabase = createClient()

	const handleGoogleSignIn = async () => {
		setIsLoading(true)
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl || '/dashboard'}`,
					queryParams: {
						prompt: 'select_account',
					},
				},
			})
			if (error) {
				console.error('Error signing in with Google:', error.message)
				setIsLoading(false)
			}
		} catch (error) {
			console.error('Unexpected error:', error)
			setIsLoading(false)
		}
	}

	return (
		<Button
			type='button'
			disabled={isLoading || disabled}
			variant='outline'
			size='xl'
			className='w-full'
			onClick={handleGoogleSignIn}
		>
			{isLoading ? (
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='animate-spin'
				/>
			) : (
				<GoogleGlyph />
			)}{' '}
			{typeSubmit === 'signup' ? 'Sign Up with Google' : 'Sign In with Google'}
		</Button>
	)
}
