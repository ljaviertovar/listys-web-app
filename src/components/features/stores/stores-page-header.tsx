import { PageHeader } from '@/components/app'

const STORES_PAGE_DESCRIPTION = 'The stores of your receipts. Rename a store, or merge two names for the same store.'

interface StoresPageHeaderProps {
	count?: number
}

export function StoresPageHeader({ count }: StoresPageHeaderProps) {
	return (
		<PageHeader
			back={{ href: '/tickets', label: 'Back to Receipts' }}
			title='My Stores'
			entity='store'
			desc={STORES_PAGE_DESCRIPTION}
			count={count === undefined ? undefined : { value: count, one: 'store', many: 'stores' }}
			testId='stores-page-header'
		/>
	)
}
