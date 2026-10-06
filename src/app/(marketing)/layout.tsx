import { Footer, Header, LandingSprite } from '@/components/marketing'

import '@/components/marketing/landing-page/landing.css'

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex min-h-screen flex-col bg-[radial-gradient(ellipse_75%_52%_at_50%_0%,#FFFFFF_0%,rgba(255,255,255,0.5)_42%,transparent_78%),linear-gradient(180deg,rgba(248,251,255,0)_0%,rgba(227,240,255,0.85)_100%),linear-gradient(90deg,#EDF3FE_0%,#F4F8FF_28%,#F4F8FF_72%,#EFF4FE_100%)] bg-fixed font-display text-slate-600 selection:bg-blue-900 selection:text-white'>
			<LandingSprite />
			<Header />

			<main
				id='main-container'
				data-testid='main-container'
			>
				{children}
			</main>

			<Footer />
		</div>
	)
}
