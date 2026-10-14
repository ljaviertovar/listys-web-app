import { redirect } from 'next/navigation'

import { PageContainer, PageHeader } from '@/components/app'
import { GroupsList } from '@/components/features/shopping-lists'

import { createClient } from '@/lib/supabase/server'

import { getGroups } from '@/lib/api/endpoints'

export default async function GroupsPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const { data: groups, error } = await getGroups()

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Shopping List Groups'
				desc='Organize your shopping lists into groups or stores. Eg: Groceries, Electronics, Walmart, etc.'
			/>

			<PageContainer>
				{error && (
					<div
						role='alert'
						className='rounded-xl bg-destructive/10 p-4 text-sm text-destructive'
					>
						Error loading groups: {error}
					</div>
				)}

				<GroupsList groups={groups ?? []} />
			</PageContainer>
		</>
	)
}
