import Image from 'next/image'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import Logo from '@/components/commons/logo'

import { AuthBackLink } from './auth-back-link'
import { AUTH_COPY, type AuthMode } from './helpers/auth-copy'

const WORDMARK_CLASS_NAME = 'font-display text-xl leading-none font-extrabold tracking-[-0.02em]'

/**
 * The photo of the auth screens. On a phone it is the header above the form sheet (logo, back link, title); from `lg` it is
 * the panel beside the form, with the invitation to register in place of the title. Each mode has its own banner under the same scrim.
 */
export function AuthHero({ mode }: { mode: AuthMode }) {
	const copy = AUTH_COPY[mode]
	const banner = mode === 'signin' ? '/images/auth/signin-banner.webp' : '/images/auth/signup-banner.webp'

	return (
		<section
			data-testid='auth-hero'
			aria-label='Why create a Listys account'
			className='relative isolate flex min-h-37.5 flex-1 flex-col justify-between overflow-hidden bg-slate-900 px-5 pt-3 pb-12 text-white lg:order-last lg:min-h-0 lg:min-w-0 lg:shrink lg:grow lg:basis-140 lg:justify-end lg:rounded-3xl lg:p-12 lg:shadow-card'
		>
			<Image
				src={banner}
				alt=''
				fill
				priority
				sizes='(min-width: 1024px) 50vw, 100vw'
				className='-z-20 object-cover'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 bg-linear-to-b from-slate-900/55 via-slate-900/38 via-40% to-slate-900/90 lg:from-slate-900/18'
			/>

			<div className='relative flex min-h-11 items-center justify-between lg:hidden'>
				<Logo testId='auth-hero-logo' wordmarkClassName={WORDMARK_CLASS_NAME} />
				<AuthBackLink tone='dark-surface' />
			</div>
			<div className='relative lg:hidden'>
				<h1 className='font-display text-2xl leading-[1.17] font-bold tracking-tight text-balance'>{copy.title}</h1>
				<p className='mt-1.5 text-sm leading-normal text-slate-300'>{copy.lead}</p>
			</div>

			<div className='relative hidden max-w-135 gap-5 lg:grid'>
				<h2 className='font-display text-4xl leading-[1.11] font-bold tracking-[-0.03em] text-balance'>{copy.hero.headline}</h2>
				<p className='text-base leading-normal text-pretty text-white/90'>{copy.hero.body}</p>
				{copy.hero.benefits ? (
					<ul className='grid gap-3'>
						{copy.hero.benefits.map(benefit => (
							<li
								key={benefit}
								className='flex items-center gap-3 text-[15px] leading-snug font-medium'
							>
								<span
									aria-hidden='true'
									className='flex size-7 flex-none items-center justify-center rounded-full bg-white/18'
								>
									<HugeiconsIcon
										icon={Tick02Icon}
										strokeWidth={2.4}
										className='size-4'
									/>
								</span>
								{benefit}
							</li>
						))}
					</ul>
				) : (
					<Button
						asChild
						variant='inverse'
						size='xl'
						className='w-fit'
					>
						<Link
							href={AUTH_COPY.signup.path}
							data-testid='auth-hero-cta'
						>
							Create Your Account
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								data-icon='inline-end'
							/>
						</Link>
					</Button>
				)}
			</div>
		</section>
	)
}
