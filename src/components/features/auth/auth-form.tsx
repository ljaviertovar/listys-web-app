'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons'

import { createClient } from '@/lib/supabase/client'
import { signInSchema, signUpSchema, MIN_PASSWORD_LENGTH, type SignInInput } from '@/lib/validations/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/components/commons'

import { AuthModeSwitch } from './auth-mode-switch'
import { AuthPasswordInput } from './auth-password-input'
import GoogleButtonSignin from './google-button-signin'
import { AUTH_COPY, type AuthMode } from './helpers/auth-copy'
import { describeAuthError } from './helpers/describe-auth-error'

/** The sign-in and sign-up form: mode switch, Google, email and password with their errors, and the terms line. */
export function AuthForm({ mode }: { mode: AuthMode }) {
	const router = useRouter()
	const copy = AUTH_COPY[mode]
	const isSignUp = mode === 'signup'
	const [serverError, setServerError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInInput>({
		resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
		defaultValues: { email: '', password: '' },
	})

	const onSubmit = async (values: SignInInput) => {
		setServerError(null)

		try {
			const supabase = createClient()
			const { error } = isSignUp
				? await supabase.auth.signUp({
						...values,
						options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
					})
				: await supabase.auth.signInWithPassword(values)

			if (error) throw error

			router.push('/dashboard')
			router.refresh()
		} catch (error: unknown) {
			setServerError(
				describeAuthError(
					error instanceof Error ? error.message : undefined,
					isSignUp
						? 'We couldn’t create your account. Check your details and try again.'
						: 'We couldn’t sign you in. Check your connection and try again.',
				),
			)
		}
	}

	return (
		<form
			data-testid='auth-form'
			noValidate
			onSubmit={handleSubmit(onSubmit)}
			className='grid gap-5'
		>
			<AuthModeSwitch mode={mode} />

			{/* On a phone the title lives in the photo header above the sheet. */}
			<div className='hidden lg:block'>
				<h1 className='font-display text-4xl leading-[1.11] font-bold tracking-[-0.03em] text-balance'>{copy.title}</h1>
				<p className='mt-2 text-base leading-normal text-slate-600'>{copy.lead}</p>
			</div>

			{serverError ? (
				<Alert
					variant='destructive-soft'
					data-testid='auth-error'
				>
					<HugeiconsIcon
						icon={AlertCircleIcon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					<AlertDescription>{serverError}</AlertDescription>
				</Alert>
			) : null}

			<GoogleButtonSignin
				typeSubmit={mode}
				callbackUrl='/dashboard'
				disabled={isSubmitting}
				onError={() => setServerError('We couldn’t open Google sign-in. Try again.')}
			/>

			<div className='flex items-center gap-3'>
				<Separator className='flex-1' />
				<span className='text-xs leading-tight text-slate-500'>{copy.dividerLabel}</span>
				<Separator className='flex-1' />
			</div>

			<div className='grid gap-4'>
				<FormField
					htmlFor='email'
					label='Email address'
					error={errors.email?.message}
					testId='auth-email-field'
				>
					<Input
						{...register('email')}
						id='email'
						type='email'
						autoComplete='email'
						placeholder='name@example.com'
						size='lg'
						disabled={isSubmitting}
						aria-invalid={errors.email ? true : undefined}
						aria-describedby={errors.email ? 'email-error' : undefined}
					/>
				</FormField>
				<FormField
					htmlFor='password'
					label='Password'
					hint={isSignUp ? `Must be at least ${MIN_PASSWORD_LENGTH} characters long` : undefined}
					error={errors.password?.message}
					testId='auth-password-field'
				>
					<AuthPasswordInput
						{...register('password')}
						id='password'
						autoComplete={isSignUp ? 'new-password' : 'current-password'}
						placeholder='••••••••••••'
						disabled={isSubmitting}
						aria-invalid={errors.password ? true : undefined}
						aria-describedby={errors.password ? 'password-error' : isSignUp ? 'password-hint' : undefined}
					/>
				</FormField>
			</div>

			<Button
				type='submit'
				size='xl'
				disabled={isSubmitting}
				className='w-full'
			>
				{isSubmitting ? (
					<>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='animate-spin motion-reduce:animate-none'
						/>
						{copy.submittingLabel}
					</>
				) : (
					copy.submitLabel
				)}
			</Button>

		</form>
	)
}
