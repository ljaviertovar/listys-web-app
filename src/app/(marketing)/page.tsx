import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/marketing/LandingPage'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing',
}

export default async function Page() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	if (user) redirect('/dashboard')

	return <LandingPage />
}
