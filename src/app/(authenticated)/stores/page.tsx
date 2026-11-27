import { redirect } from 'next/navigation'

import { PageContainer } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { StoresList, StoresPageHeader } from '@/components/features/stores'

import { createClient } from '@/lib/supabase/server'

import { getStores } from '@/lib/api/endpoints'

export default async function StoresPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: stores, error } = await getStores()

	return (
		<>
			<StoresPageHeader count={stores?.length ?? 0} />

			<PageContainer>
				{error ? (
					<RetryableError
						message='We couldn’t load your stores.'
						href='/stores'
						testId='stores-load-error'
					/>
				) : (
					<StoresList stores={stores ?? []} />
				)}
			</PageContainer>
		</>
	)
}
