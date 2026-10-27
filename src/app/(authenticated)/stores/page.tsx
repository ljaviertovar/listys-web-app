import { redirect } from 'next/navigation'

import { PageContainer, PageHeader } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { StoresList } from '@/components/features/stores'

import { createClient } from '@/lib/supabase/server'

import { getStores } from '@/lib/api/endpoints'

const STORES_PAGE_DESCRIPTION = 'The stores of your receipts. Rename a store, or merge two names for the same store.'

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
			<PageHeader
				variant='screen'
				back={{ href: '/tickets', label: 'Back to Receipts' }}
				title='My Stores'
				desc={STORES_PAGE_DESCRIPTION}
			/>

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
