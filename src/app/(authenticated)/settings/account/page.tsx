import { redirect } from 'next/navigation'
import {
	UserAccountIcon,
	Calendar01Icon,
	LinkBackwardIcon,
	Mail01Icon,
	Shield01Icon,
} from '@hugeicons/core-free-icons'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader, PageContainer, CardHeaderContent } from '@/components/app'
import { DetailsList } from '@/components/commons'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils'

export default async function AccountPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const provider = user.app_metadata?.provider || 'email'
	const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
	const accountCreatedAt = user.created_at ? new Date(user.created_at) : null
	const isVerified = Boolean(user.email_confirmed_at)

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Account'
				desc='Sign-in and account details'
			/>

			<PageContainer>
				<div className='grid gap-4 lg:grid-cols-2'>
					<Card
						size='sm'
					>
						<CardHeader>
							<CardHeaderContent
								icon={Shield01Icon}
								title='Account Information'
								description='Sign-in provider and account dates'
							/>
						</CardHeader>
						<CardContent>
							<DetailsList
								testId='account-information-details'
								items={[
									{ label: 'Sign-in Provider', value: <span className='capitalize'>{provider}</span>, icon: LinkBackwardIcon },
									{ label: 'Last sign in', value: lastSignIn ? `${formatDate(lastSignIn)} at ${formatTime(lastSignIn)}` : 'Unknown', icon: Calendar01Icon },
									{ label: 'Account created', value: accountCreatedAt ? `${formatDate(accountCreatedAt)} at ${formatTime(accountCreatedAt)}` : 'Unknown', icon: Calendar01Icon },
								]}
							/>
						</CardContent>
					</Card>

					<Card
						size='sm'
					>
						<CardHeader>
							<CardHeaderContent
								icon={UserAccountIcon}
								title='Security'
								description='Email verification status'
							/>
						</CardHeader>
						<CardContent space='stack'>
							<DetailsList
								testId='account-security-details'
								items={[
									{ label: 'Email confirmation', value: <Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Verified' : 'Pending'}</Badge> },
									{ label: 'Email', value: user.email || 'Unknown', icon: Mail01Icon },
								]}
							/>
							<p className='text-sm text-muted-foreground'>Your profile photo comes from your sign-in provider.</p>
						</CardContent>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
