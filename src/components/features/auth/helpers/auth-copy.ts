export type AuthMode = 'signin' | 'signup'

interface AuthCopy {
	/** Route of this screen: the mode switch links to both. */
	path: string
	title: string
	lead: string
	googleLabel: string
	dividerLabel: string
	submitLabel: string
	submittingLabel: string
	termsLead: string
	hero: {
		headline: string
		body: string
		/** Sign in invites to register with a button; sign up lists what the account gives. */
		benefits?: string[]
	}
}

/** Copy of the Design system v2 auth boards (B desktop, C mobile), per screen. Buttons and links are in Title Case. */
export const AUTH_COPY: Record<AuthMode, AuthCopy> = {
	signin: {
		path: '/auth/signin',
		title: 'Welcome back',
		lead: 'Log in to your lists, receipts and shopping history.',
		googleLabel: 'Sign In with Google',
		dividerLabel: 'Or continue with email',
		submitLabel: 'Sign In with Email',
		submittingLabel: 'Signing In…',
		termsLead: 'By clicking continue, you agree to our',
		hero: {
			headline: 'Your next shop is already half planned.',
			body: 'Your lists, receipts and history are waiting. New here? Create an account and turn your first receipt into a list you can reuse on every trip.',
		},
	},
	signup: {
		path: '/auth/signup',
		title: 'Create account',
		lead: 'One account for your lists, receipts and shopping history.',
		googleLabel: 'Sign Up with Google',
		dividerLabel: 'Or register with email',
		submitLabel: 'Create Account with Email',
		submittingLabel: 'Creating Account…',
		termsLead: 'By signing up, you agree to our',
		hero: {
			headline: 'Turn your next receipt into a smarter list.',
			body: 'Snap a photo, get your items back, and shop from a list that learns with every trip. Create your account to start.',
			benefits: ['Snap a receipt and get the items back', 'Reuse your lists on every trip', 'Share lists with your household'],
		},
	},
}

export const AUTH_SWITCH_OPTIONS: { mode: AuthMode; label: string }[] = [
	{ mode: 'signin', label: 'Sign In' },
	{ mode: 'signup', label: 'Create Account' },
]
