import Header from '@/components/marketing/header'
import HeaderMobile from '@/components/marketing/header-mobile'

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col min-h-screen'>
			<Header />
			<HeaderMobile />

			<main className='flex-1'>{children}</main>
		</div>
	)
}
