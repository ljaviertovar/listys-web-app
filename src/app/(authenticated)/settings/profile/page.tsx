import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
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
import { PageHeader, PageContainer, BackLink, CardHeaderContent } from '@/components/app'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils/format-date'

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
				title='Profile'
				desc='Personal data linked to your account'
			/>

			<PageContainer>
				<BackLink
					href='/dashboard'
					label='Back to Dashboard'
				/>

				<div className='grid gap-4 lg:grid-cols-3'>
					<Card
						size='sm'
						className='lg:col-span-1 h-fit hover:border-primary/50 transition-colors'
					>
						<CardHeader className='flex-row items-start justify-between'>
							<CardHeaderContent
								icon={UserCircleIcon}
								title='Profile'
								description='Identity overview'
							/>
							<Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Verified' : 'Pending'}</Badge>
						</CardHeader>
						<CardContent className='flex flex-col items-center gap-3'>
							<Avatar className='h-24 w-24 ring-2 ring-primary/20'>
								<AvatarImage
									src={avatarUrl || '/img/avatars/01.png'}
									alt={displayName}
								/>
								<AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div className='text-center'>
								<p className='text-sm font-semibold'>{displayName}</p>
								<p className='text-xs text-muted-foreground'>Avatar is managed by your auth provider.</p>
							</div>
							<div className='w-full rounded-xl border border-primary/20 bg-primary/5 p-3'>
								<div className='flex items-center gap-2 text-xs font-medium text-primary'>
									<HugeiconsIcon
										icon={LinkBackwardIcon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Connected provider
								</div>
								<p className='mt-1 text-sm capitalize'>{provider}</p>
							</div>
						</CardContent>
					</Card>

					<Card
						size='sm'
						className='lg:col-span-2 hover:border-primary/50 transition-colors'
					>
						<CardHeader>
							<CardHeaderContent
								icon={UserIdVerificationIcon}
								title='Personal Details'
								description='Data available in your authenticated profile'
							/>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={UserCircleIcon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Display name
								</div>
								<span className='text-sm font-medium'>{displayName}</span>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={Mail01Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Email
								</div>
								<span className='text-sm font-medium'>{user.email || 'Unknown'}</span>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={UserIdVerificationIcon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Email verified
								</div>
								<Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Yes' : 'No'}</Badge>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={Calendar01Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Joined
								</div>
								<span className='text-sm font-medium'>
									{user.created_at
										? `${formatDate(new Date(user.created_at))} at ${formatTime(new Date(user.created_at))}`
										: 'Unknown'}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
