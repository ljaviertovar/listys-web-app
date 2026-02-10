'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GoogleButtonSignin } from '@/components/features/auth'
import { BackLink } from '@/components/app'
import Logo from '@/components/commons/logo'

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
			setError(error.message || 'An error occurred during registration')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden'>
			{/* Modern gradient blobs */}
			<div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background'>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 50, 0],
						y: [0, -30, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					style={{ willChange: 'transform' }}
					className='absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#7C3AED]/20 blur-[100px] motion-reduce:animate-none'
				/>
				<motion.div
					animate={{
						scale: [1, 1.1, 1],
						x: [0, -40, 0],
						y: [0, 50, 0],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					style={{ willChange: 'transform' }}
					className='absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#EC4899]/25 blur-[100px] motion-reduce:animate-none'
				/>
				<motion.div
					animate={{
						scale: [1, 1.3, 1],
						y: [0, 40, 0],
					}}
					transition={{
						duration: 18,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					style={{ willChange: 'transform' }}
					className='absolute -bottom-[20%] left-[10%] w-[70%] h-[70%] rounded-full bg-[#6366F1]/15 blur-[120px] motion-reduce:animate-none'
				/>
			</div>
			<div className='absolute top-0 left-0 w-full h-full -z-10 opacity-[0.03] pointer-events-none bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' />

			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='w-full max-w-md'
			>
				<div className='mb-8 flex justify-center'>
					<BackLink
						href='/'
						label='Back to Home'
					/>
				</div>

				<Card className='border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl'>
					<CardHeader className='pb-2 text-center'>
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
							className='mx-auto mb-4 flex items-center justify-center'
						>
							<Logo />
						</motion.div>
						<CardTitle className='text-3xl font-bold tracking-tight'>Create account</CardTitle>
						<CardDescription className='text-base'>
							Already have an account?{' '}
							<Link
								href='/auth/signin'
								className='font-semibold text-primary transition-colors hover:text-primary/80 hover:underline'
							>
								Sign in here
							</Link>
						</CardDescription>
					</CardHeader>
					<CardContent className='pt-6'>
						<form
							className='grid gap-6'
							onSubmit={handleSignUp}
						>
							<AnimatePresence mode='wait'>
								{error && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive'
									>
										<AlertCircle className='h-5 w-5 shrink-0' />
										{error}
									</motion.div>
								)}
							</AnimatePresence>

							<GoogleButtonSignin
								typeSubmit='signup'
								callbackUrl='/dashboard'
							/>

							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<Separator className='w-full border-border/60' />
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='bg-card px-3 text-muted-foreground font-medium'>Or register with email</span>
								</div>
							</div>

							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label
										htmlFor='email'
										className='text-sm font-semibold ml-1'
									>
										Email address
									</Label>
									<div className='relative group'>
										<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors'>
											<Mail className='h-5 w-5' />
										</div>
										<Input
											id='email'
											name='email'
											type='email'
											autoComplete='email'
											required
											value={email}
											onChange={e => setEmail(e.target.value)}
											placeholder='name@example.com'
											className='pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors rounded-xl shadow-xs'
										/>
									</div>
								</div>
								<div className='grid gap-2'>
									<Label
										htmlFor='password'
										className='text-sm font-semibold ml-1'
									>
										Password
									</Label>
									<div className='relative group'>
										<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors'>
											<Lock className='h-5 w-5' />
										</div>
										<Input
											id='password'
											name='password'
											type='password'
											autoComplete='new-password'
											required
											minLength={6}
											value={password}
											onChange={e => setPassword(e.target.value)}
											placeholder='••••••••••••'
											className='pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors rounded-xl shadow-xs'
										/>
									</div>
									<p className='text-[10px] text-muted-foreground ml-1'>Must be at least 6 characters long</p>
								</div>
							</div>

							<Button
								type='submit'
								variant='outline'
								disabled={loading}
								className='w-full h-11 text-base font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] rounded-xl'
							>
								{loading ? (
									<div className='flex items-center gap-2'>
										<span className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
										Creating account…
									</div>
								) : (
									'Create account with email'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				<p className='mt-8 text-center text-sm text-muted-foreground px-8'>
					By signing up, you agree to our{' '}
					<Link
						href='/terms'
						className='font-medium text-foreground hover:underline'
					>
						Terms of Service
					</Link>{' '}
					and{' '}
					<Link
						href='/privacy'
						className='font-medium text-foreground hover:underline'
					>
						Privacy Policy
					</Link>
					.
				</p>
			</motion.div>
		</main>
	)
}
