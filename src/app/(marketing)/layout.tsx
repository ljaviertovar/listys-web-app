import { Header, HeaderMobile } from '@/components/marketing'

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col min-h-screen'>
			<Header />
			<HeaderMobile />

			<main className='flex-1'>{children}</main>
		</div>
	)
}
