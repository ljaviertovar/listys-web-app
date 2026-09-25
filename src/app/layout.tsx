import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'
import { PwaRegister } from '@/components/features/pwa'

import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ['latin'],
	variable: '--font-plus-jakarta',
	display: 'swap',
})

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-ibm-plex-mono',
	display: 'swap',
})

import './globals.css'
import { ActiveSessionInit } from '@/components/app/active-session'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing',
	manifest: '/manifest.webmanifest',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Listys',
	},
	icons: {
		apple: [{ url: '/icons/pwa/ios/180.png', sizes: '180x180', type: 'image/png' }],
		icon: [
			{ url: '/icons/pwa/ios/32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/icons/pwa/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icons/pwa/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
		],
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
	themeColor: '#0f172a',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${plusJakartaSans.variable} ${inter.variable} ${ibmPlexMono.variable}`}
		>
			<body className='font-sans relative scroll-smooth focus:scroll-auto'>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					<ActiveSessionInit />
					<PwaRegister />
					{children}
					<Toaster position='top-center' />
				</ThemeProvider>
			</body>
		</html>
	)
}
