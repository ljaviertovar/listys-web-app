import { PageHeader } from '@/components/app'

import { CreateBaseListDialog } from './create-base-list-dialog'

export function BaseListsPageHeader() {
	return (
		<PageHeader
			title='Lists'
			entity='list'
			desc='All your lists in one place. Start with the things you always buy.'
			back={{ href: '/dashboard', label: 'Back to Dashboard' }}
			aside={<CreateBaseListDialog size='lg' />}
			testId='base-lists-page-header'
		/>
	)
}
