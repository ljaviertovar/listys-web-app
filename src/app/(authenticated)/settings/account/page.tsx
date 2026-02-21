import { redirect } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	SecurityCheckIcon,
	UserAccountIcon,
	Calendar01Icon,
	LinkBackwardIcon,
	Shield01Icon,
	Mail01Icon,
} from '@hugeicons/core-free-icons'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader, PageContainer, BackLink, CardHeaderContent } from '@/components/app'

import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/utils/format-date'

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
				title='Account'
				desc='Security and account metadata'
			/>

			<PageContainer>
				<BackLink
					href='/dashboard'
					label='Back to Dashboard'
				/>

				<div className='grid gap-4 lg:grid-cols-2'>
					<Card
						size='sm'
						className='hover:border-primary/50 transition-colors'
					>
						<CardHeader>
							<CardHeaderContent
								icon={UserAccountIcon}
								title='Account Information'
								description='Core account metadata'
							/>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={UserAccountIcon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									User ID
								</div>
								<code className='max-w-[55%] truncate text-xs font-medium'>{user.id}</code>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={LinkBackwardIcon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Sign-in provider
								</div>
								<span className='text-sm font-medium capitalize'>{provider}</span>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={Calendar01Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Last sign in
								</div>
								<span className='text-sm font-medium'>
									{lastSignIn ? `${formatDate(lastSignIn)} at ${formatTime(lastSignIn)}` : 'Unknown'}
								</span>
							</div>

							<div className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<HugeiconsIcon
										icon={Calendar01Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Created at
								</div>
								<span className='text-sm font-medium'>
									{accountCreatedAt ? `${formatDate(accountCreatedAt)} at ${formatTime(accountCreatedAt)}` : 'Unknown'}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card
						size='sm'
						className='hover:border-primary/50 transition-colors'
					>
						<CardHeader>
							<CardHeaderContent
								icon={Shield01Icon}
								title='Security'
								description='Authentication and verification status'
							/>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-background p-3'>
								<div className='flex items-center justify-between gap-2'>
									<div className='flex items-center gap-2 text-sm font-medium'>
										<HugeiconsIcon
											icon={SecurityCheckIcon}
											strokeWidth={2}
											className='h-4 w-4'
										/>
										Email confirmation
									</div>
									<Badge variant={isVerified ? 'completed' : 'pending'}>{isVerified ? 'Verified' : 'Pending'}</Badge>
								</div>
								<p className='mt-2 text-sm text-muted-foreground'>
									{isVerified ? 'Your email address is confirmed.' : 'Your email address is not confirmed yet.'}
								</p>
							</div>

							<div className='rounded-xl border border-border/70 bg-muted/20 p-3'>
								<div className='flex items-center gap-2 text-sm font-medium'>
									<HugeiconsIcon
										icon={Mail01Icon}
										strokeWidth={2}
										className='h-4 w-4'
									/>
									Primary email
								</div>
								<p className='mt-1 text-sm font-medium'>{user.email || 'Unknown'}</p>
							</div>

							<div className='rounded-xl border border-border/70 bg-muted/20 p-3'>
								<p className='text-sm font-medium'>Manage authentication</p>
								<p className='mt-1 text-sm text-muted-foreground'>
									Password, magic link, and external provider controls are managed by Supabase Auth.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageContainer>
		</>
	)
}
