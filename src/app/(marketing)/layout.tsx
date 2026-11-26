import { Footer, Header } from '@/components/marketing'

import './marketing.css'

/** The landing's thermal paper: a warm off-white page with a fine grain, ink text, and Listys blue as the only accent. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			data-testid='marketing-root'
			className='paper-grain flex min-h-screen flex-col overflow-x-clip bg-paper font-sans text-base leading-normal text-paper-text selection:bg-primary selection:text-primary-foreground'
		>
			<Header />

			<main
				id='main-container'
				data-testid='main-container'
				className='flex-1'
			>
				{children}
			</main>

			<Footer />
		</div>
	)
}
