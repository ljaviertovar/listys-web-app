import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import LandingPageContent from '@/components/marketing/landing-page-content'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description:
		'Manage your shopping lists with AI-powered receipt processing. Transform photos into organized lists instantly.',
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
		description: 'Transform receipts into organized shopping lists with AI. Save time and track spending.',
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
		description: 'Transform receipts into organized shopping lists with AI.',
		images: ['/og-image.jpg'],
		creator: '@listysapp',
	},
	metadataBase: new URL('https://listys.app'),
}

export default async function Page() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	//if (user) redirect('/dashboard')

	return <LandingPageContent />
}
