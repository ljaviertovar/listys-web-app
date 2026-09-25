import { Header, LandingSprite } from '@/components/marketing'

import '@/components/marketing/landing-page/landing.css'

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex min-h-screen flex-col bg-[linear-gradient(90deg,#EDF3FE_0%,#F4F8FF_28%,#F4F8FF_72%,#EFF4FE_100%)] font-display text-slate-600 selection:bg-blue-900 selection:text-white'>
			<LandingSprite />
			<Header />

			<main
				id='top'
				className='flex-1'
			>
				{children}
			</main>
		</div>
	)
}
