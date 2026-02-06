import Header from '@/components/marketing/header'
import HeaderMobile from '@/components/marketing/header-mobile'

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<HeaderMobile />

			<main className='pt-14 md:pt-0'>{children}</main>
		</>
	)
}
