import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { SonnerToaster } from '@/components/app/sonner-toaster'
import { PwaRegister } from '@/components/features/pwa'

import localFont from 'next/font/local'

const sourceSans3 = localFont({
	src: '../../public/fonts/source-sans-3.woff2',
	weight: '400 900',
	variable: '--font-source-sans-3',
	display: 'swap',
})

const bricolageGrotesque = localFont({
	src: '../../public/fonts/bricolage-grotesque.woff2',
	weight: '700 800',
	variable: '--font-bricolage-grotesque',
	display: 'swap',
})

const bricolageGrotesqueBrand = localFont({
	src: '../../public/fonts/bricolage-grotesque-semibold.woff2',
	weight: '600',
	variable: '--font-bricolage-grotesque-brand',
	display: 'swap',
	preload: false,
})

const ibmPlexMono = localFont({
	src: [
		{ path: '../../public/fonts/ibm-plex-mono-regular.woff2', weight: '400' },
		{ path: '../../public/fonts/ibm-plex-mono-medium.woff2', weight: '500' },
	],
	variable: '--font-ibm-plex-mono',
	display: 'swap',
	preload: false,
	adjustFontFallback: false,
})

import './globals.css'
import { ActiveSessionInit, NavigationProgress } from '@/components/app'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description:
		'Review items read from your receipts and choose what to add to reusable shopping lists.',
	keywords: [
		'shopping list',
		'grocery app',
		'AI receipt scanner',
		'meal planning',
		'expense tracker',
		'smart shopping',
	],
	authors: [{ name: 'Listys Team' }],
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://listys.app',
		title: 'Listys - Smart Shopping List Manager',
		description: 'Review items read from your receipts and choose what to add to a reusable shopping list.',
		siteName: 'Listys',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Listys App Preview',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Listys - Smart Shopping List Manager',
		description: 'Read items from receipts, review them, and choose what to add to reusable shopping lists.',
		images: ['/og-image.jpg'],
		creator: '@listysapp',
	},
	metadataBase: new URL('https://listys.app'),
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
	viewportFit: 'cover',
	themeColor: '#15171b',
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
			className={`${sourceSans3.variable} ${bricolageGrotesque.variable} ${bricolageGrotesqueBrand.variable} ${ibmPlexMono.variable}`}
		>
			<body className='font-sans relative scroll-smooth focus:scroll-auto'>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					<ActiveSessionInit />
					<NavigationProgress />
					<PwaRegister />
					{children}
					<SonnerToaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
