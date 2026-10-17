import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { AUTH_COPY, AUTH_SWITCH_OPTIONS, type AuthMode } from './helpers/auth-copy'

/** The segmented switch on top of the auth form: two links, the current screen raised in white. */
export function AuthModeSwitch({ mode }: { mode: AuthMode }) {
	return (
		<nav
			aria-label='Sign in or create an account'
			data-testid='auth-mode-switch'
			className='flex gap-1 rounded-2xl bg-secondary p-1'
		>
			{AUTH_SWITCH_OPTIONS.map(option => (
				<Button
					key={option.mode}
					asChild
					variant='segment'
					size='touch'
					className='flex-1'
				>
					<Link
						href={AUTH_COPY[option.mode].path}
						aria-current={option.mode === mode ? 'page' : undefined}
					>
						{option.label}
					</Link>
				</Button>
			))}
		</nav>
	)
}
