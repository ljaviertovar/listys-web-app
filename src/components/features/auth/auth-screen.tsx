import Logo from '@/components/commons/logo'

import { AuthBackLink } from './auth-back-link'
import { AuthForm } from './auth-form'
import { AuthHero } from './auth-hero'
import type { AuthMode } from './helpers/auth-copy'

const WORDMARK_CLASS_NAME = 'font-display text-[22px] leading-none font-extrabold tracking-[-0.02em]'

/**
 * A whole sign-in or sign-up screen. Phone: the photo header with the form on a white sheet that rises over it. From `lg`:
 * the form on a white panel beside the photo panel. The form is rendered once and the layout moves around it.
 */
export function AuthScreen({ mode }: { mode: AuthMode }) {
	return (
		<main
			data-testid='auth-screen'
			className='flex min-h-svh flex-col bg-slate-900 text-slate-900 lg:flex-row lg:gap-4 lg:bg-background lg:p-4'
		>
			<AuthHero mode={mode} />
			<section
				data-testid='auth-panel'
				className='relative -mt-6 rounded-t-3xl bg-card px-5 pt-5 pb-7 lg:mt-0 lg:flex lg:min-w-0 lg:shrink lg:grow lg:basis-130 lg:flex-col lg:rounded-3xl lg:p-8 lg:shadow-card'
			>
				<header className='hidden items-center justify-between gap-4 lg:flex'>
					<Logo wordmarkClassName={WORDMARK_CLASS_NAME} />
					<AuthBackLink tone='light-surface' />
				</header>
				<div className='lg:flex lg:flex-1 lg:items-center lg:justify-center lg:py-8'>
					<div className='w-full lg:max-w-100'>
						<AuthForm mode={mode} />
					</div>
				</div>
			</section>
		</main>
	)
}
