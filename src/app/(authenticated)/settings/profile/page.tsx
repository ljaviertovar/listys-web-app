import { redirect } from 'next/navigation'
import {
	UserCircleIcon,
	Mail01Icon,
	Calendar01Icon,
	UserIdVerificationIcon,
	LinkBackwardIcon,
} from '@hugeicons/core-free-icons'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeader, PageContainer, CardHeaderContent } from '@/components/app'
import { DetailsList } from '@/components/commons'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils'

export default async function ProfilePage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/signin')
	}

	const displayName =
		user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
	const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
	const provider = user.app_metadata?.provider || 'email'
	const isVerified = Boolean(user.email_confirmed_at)

	return (
		<>
			<PageHeader
				variant='screen'
				back={{ href: '/dashboard', label: 'Back to Dashboard' }}
				title='Profile'
				desc='Your profile information'
			/>

			<PageContainer>
				<div className='grid gap-4 lg:grid-cols-3'>
					<Card
						size='sm'
						className='lg:col-span-1 h-fit'
					>
						<CardHeader className='flex-row items-start justify-between'>
							<CardHeaderContent
								icon={UserCircleIcon}
								title='Profile'
								description='Identity overview'
							/>
							<Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Verified' : 'Pending'}</Badge>
						</CardHeader>
						<CardContent
							space='stack'
							className='items-center'
						>
							<Avatar
								size='2xl'
								ring
							>
								<AvatarImage
									src={avatarUrl || '/img/avatars/01.png'}
									alt={displayName}
								/>
								<AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<p className='text-center text-xs text-muted-foreground'>Your profile photo comes from your sign-in provider.</p>
							<DetailsList
								testId='profile-summary-details'
								items={[{ label: 'Sign-in Provider', value: <span className='capitalize'>{provider}</span>, icon: LinkBackwardIcon }]}
							/>
						</CardContent>
					</Card>

					<Card
						size='sm'
						className='lg:col-span-2'
					>
						<CardHeader>
							<CardHeaderContent
								icon={UserIdVerificationIcon}
								title='Personal Details'
								description='Name and email on your profile'
							/>
						</CardHeader>
						<CardContent>
							<DetailsList
								testId='profile-personal-details'
								items={[
									{ label: 'Display name', value: displayName, icon: UserCircleIcon },
									{ label: 'Email', value: user.email || 'Unknown', icon: Mail01Icon },
									{ label: 'Email verified', value: <Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Yes' : 'No'}</Badge>, icon: UserIdVerificationIcon },
									{
										label: 'Account created',
										value: user.created_at
											? `${formatDate(new Date(user.created_at))} at ${formatTime(new Date(user.created_at))}`
											: 'Unknown',
										icon: Calendar01Icon,
									},
								]}
							/>
						</CardContent>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
