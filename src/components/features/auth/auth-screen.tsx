import Logo from '@/components/commons/logo'
import { Perforation } from '@/components/commons/perforation'

import { AuthBackLink } from './auth-back-link'
import { AuthForm } from './auth-form'
import { AuthHero } from './auth-hero'
import type { AuthMode } from './helpers/auth-copy'

const WORDMARK_CLASS_NAME = 'font-brand text-[22px] leading-none font-semibold tracking-[-0.02em]'

/**
 * A whole sign-in or sign-up screen. Phone: the photo header with the form on a sheet of receipt paper that rises over it, torn
 * along a perforation. From `lg`: the form on a paper panel beside the photo panel. The form is rendered once and the layout moves around it.
 */
export function AuthScreen({ mode }: { mode: AuthMode }) {
	return (
		<main
			data-testid='auth-screen'
			className='flex min-h-svh flex-col bg-muted text-slate-900 dark:bg-sidebar dark:text-foreground lg:flex-row lg:gap-4 lg:p-4'
		>
			<AuthHero mode={mode} />
			<section
				data-testid='auth-panel'
				className='paper-grain relative -mt-6 rounded-t-3xl bg-paper px-5 pt-7 pb-7 dark:bg-card dark:bg-none lg:mt-0 lg:flex lg:min-w-0 lg:shrink lg:grow lg:basis-130 lg:flex-col lg:rounded-3xl lg:p-8 lg:shadow-sm'
			>
				<Perforation
					testId='auth-panel-perforation'
					className='absolute inset-x-4 top-2.5 w-auto lg:hidden'
				/>
				<header className='hidden items-center justify-between gap-4 lg:flex'>
					<Logo testId='auth-screen-logo' wordmarkClassName={WORDMARK_CLASS_NAME} />
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
