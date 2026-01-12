'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const supabase = createClient()
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) throw error

			router.push('/dashboard')
			router.refresh()
		} catch (error: any) {
			setError(error.message || 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1 text-center'>
					<CardTitle className='text-3xl font-bold'>Sign in to Listys</CardTitle>
					<CardDescription>
						Or{' '}
						<Link
							href='/auth/signup'
							className='font-medium text-primary hover:underline'
						>
							create a new account
						</Link>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className='space-y-4'
						onSubmit={handleSignIn}
					>
						{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder='you@example.com'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								name='password'
								type='password'
								autoComplete='current-password'
								required
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder='••••••••'
							/>
						</div>
						<Button
							type='submit'
							disabled={loading}
							className='w-full'
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
