import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'
import { PwaRegister } from '@/components/features/pwa'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

import './globals.css'
import ActiveSessionInit from '@/components/app/active-session-init'

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
			className={inter.variable}
		>
			<body className={`${inter.className} relative scroll-smooth focus:scroll-auto`}>
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
