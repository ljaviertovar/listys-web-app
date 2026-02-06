'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import GoogleButtonSignin from '@/components/features/auth/google-button-signin'
import { BackLink } from '@/components/app'

export default function SignUpPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const supabase = createClient()
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
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
		<>
			<BackLink
				href='/'
				label='Back to Home'
			/>
			<div className='flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12'>
				<Card
					className='w-full max-w-md'
					size='sm'
				>
					<CardHeader className='space-y-1 text-center'>
						<CardTitle className='text-3xl font-bold'>Create your account</CardTitle>
						<CardDescription>
							Already have an account?{' '}
							<Link
								href='/auth/signin'
								className='font-medium text-primary hover:underline'
							>
								Sign in
							</Link>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							className='space-y-4'
							onSubmit={handleSignUp}
						>
							{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}

							<GoogleButtonSignin
								typeSubmit='signup'
								callbackUrl='/dashboard'
							/>

							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<Separator className='w-full' />
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='bg-card px-2 text-muted-foreground'>Or continue with</span>
								</div>
							</div>

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
									autoComplete='new-password'
									required
									minLength={6}
									value={password}
									onChange={e => setPassword(e.target.value)}
									placeholder='At least 6 characters'
								/>
							</div>
							<Button
								type='submit'
								disabled={loading}
								className='w-full'
							>
								{loading ? 'Creating account...' : 'Sign up'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
