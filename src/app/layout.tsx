import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'

import { Inter, Outfit } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

import './globals.css'
import ActiveSessionInit from '@/components/app/active-session-init'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing',
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
			className={outfit.variable}
		>
			<body className={`${inter.className} relative scroll-smooth focus:scroll-auto`}>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					<ActiveSessionInit />
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
