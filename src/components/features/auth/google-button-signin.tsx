'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HugeiconsIcon } from '@hugeicons/react'
import { GoogleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

interface Props {
	typeSubmit: 'signin' | 'signup'
	callbackUrl?: string
}

export default function GoogleButtonSignin({ typeSubmit, callbackUrl }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const supabase = createClient()

	const handleGoogleSignIn = async () => {
		setIsLoading(true)
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl || '/dashboard'}`,
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
			variant='outline'
			type='button'
			disabled={isLoading}
			className='flex items-center justify-center gap-2'
			onClick={handleGoogleSignIn}
		>
			{isLoading ? (
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='animate-spin'
				/>
			) : (
				<HugeiconsIcon
					icon={GoogleIcon}
					strokeWidth={2}
				/>
			)}{' '}
			{typeSubmit === 'signup' ? 'Sign Up with Google' : 'Sign in with Google'}
		</Button>
	)
}
