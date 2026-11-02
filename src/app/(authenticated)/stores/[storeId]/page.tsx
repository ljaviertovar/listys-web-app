import { notFound, redirect } from 'next/navigation'

import { PageContainer, PageHeader } from '@/components/app'
import { RetryableError } from '@/components/commons'
import { StoreDetailView } from '@/components/features/stores'

import { createClient } from '@/lib/supabase/server'

import { getStoreDetail } from '@/lib/api/endpoints'

export default async function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
	const { storeId } = await params
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: store, error, errorCode } = await getStoreDetail(storeId)

	if (errorCode === 'NOT_FOUND') notFound()

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/stores', label: 'Back to My Stores' }}
				title={store?.name ?? 'Store'}
				desc='What your receipts say about this store.'
			/>

			<PageContainer>
				{error || !store ? (
					<RetryableError
						message='We couldn’t load this store.'
						href={`/stores/${storeId}`}
						testId='store-detail-load-error'
					/>
				) : (
					<StoreDetailView store={store} />
				)}
			</PageContainer>
		</>
	)
}
