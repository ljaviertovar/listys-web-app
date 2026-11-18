import { PageHeader } from '@/components/app'

const STORES_PAGE_DESCRIPTION = 'The stores of your receipts. Rename a store, or merge two names for the same store.'

export function StoresPageHeader() {
	return (
		<PageHeader
			back={{ href: '/tickets', label: 'Back to Receipts' }}
			title='My Stores'
			entity='store'
			desc={STORES_PAGE_DESCRIPTION}
			testId='stores-page-header'
		/>
	)
}
