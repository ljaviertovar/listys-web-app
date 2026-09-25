import { Footer } from '@/components/marketing/footer'
import { ButtonLink } from './button-link'
import { Faq } from './faq'
import { Features } from './features'
import { Hero } from './hero'
import { HowItWorks } from './how-it-works'
import { Icon } from './landing-icons'
import { Shell } from './shell'
import { SharedListsShowcase } from './shared-lists-showcase'

function GetStarted() {
	return (
		<section
			id='get-started'
			data-testid='landing-get-started'
			className='scroll-mt-16 bg-[linear-gradient(90deg,rgba(8,13,26,.95)_0%,rgba(8,13,26,.9)_44%,rgba(8,13,26,.5)_100%),url(/images/landing/close-bg.jpg)] bg-cover bg-center max-[759px]:bg-[linear-gradient(180deg,rgba(8,13,26,.93)_0%,rgba(8,13,26,.88)_100%),url(/images/landing/close-bg.jpg)]'
		>
			<Shell className='py-20 min-[900px]:py-[110px]'>
				<h2 className='max-w-[14em] text-[clamp(31px,4.2vw,46px)] leading-[1.08] font-extrabold text-white text-balance'>
					Start with the receipt in your pocket.
				</h2>
				<p className='mt-[18px] max-w-[32em] text-[clamp(15px,1.7vw,18px)] leading-[1.55] text-slate-300'>
					Create a free account, upload one receipt, and walk out with a list your household can use this week.
				</p>
				<div className='mt-8 flex flex-col items-start gap-[14px]'>
					<ButtonLink
						size='xl'
						href='/auth/signup'
					>
						Create free account <Icon id='arr' />
					</ButtonLink>
					<span className='font-mono text-xs tracking-[.05em] text-[#A8B4C6]'>
						Google sign-in · no card · your lists stay yours
					</span>
				</div>
			</Shell>
		</section>
	)
}

/** Rendered inside the marketing layout, over the shared page background. */
export function LandingPageContent() {
	return (
		<>
			<Hero />
			<HowItWorks />
			<Features />
			<SharedListsShowcase />
			<Faq />
			<GetStarted />
			<Footer />
		</>
	)
}
