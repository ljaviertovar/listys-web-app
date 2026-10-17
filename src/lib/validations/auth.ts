import { z } from 'zod'

// Supabase hashes passwords with bcrypt, which ignores everything past 72 bytes.
const MAX_PASSWORD_LENGTH = 72
export const MIN_PASSWORD_LENGTH = 6

const emailField = z.string().trim().min(1, 'Enter your email address.').pipe(z.email('Enter a valid email address.'))

export const signInSchema = z.object({
	email: emailField,
	password: z.string().min(1, 'Enter your password.').max(MAX_PASSWORD_LENGTH, 'Password is too long.'),
})

export const signUpSchema = z.object({
	email: emailField,
	password: z
		.string()
		.min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
		.max(MAX_PASSWORD_LENGTH, 'Password is too long.'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
