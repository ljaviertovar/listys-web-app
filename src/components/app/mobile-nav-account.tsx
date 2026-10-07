'use client'

import { useRouter } from 'next/navigation'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { UserSummary } from '@/components/features/auth'

interface Props {
	user: UserSummary
	onNavigate: () => void
}

/** Who is signed in, with a 44px sign-out button, at the foot of the mobile menu. */
export function MobileNavAccount({ user, onNavigate }: Props) {
	const router = useRouter()

	const handleSignOut = async () => {
		onNavigate()
		await createClient().auth.signOut()
		router.push('/auth/signin')
		router.refresh()
	}

	return (
		<div
			data-testid='mobile-nav-account'
			className='flex items-center gap-2.5 border-t border-slate-100 px-2 pt-3 dark:border-border'
		>
			<Avatar className='size-9'>
				{user.avatarUrl ? (
					<AvatarImage
						src={user.avatarUrl}
						alt=''
					/>
				) : null}
				<AvatarFallback className='bg-blue-100 text-[13px] font-bold text-blue-700 dark:bg-primary/20 dark:text-primary'>
					{user.initials}
				</AvatarFallback>
			</Avatar>
			<span className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<span className='truncate text-sm leading-tight font-semibold'>{user.name}</span>
				<span className='truncate text-[12.5px] leading-tight text-muted-foreground'>{user.email}</span>
			</span>
			<Button
				variant='ghost'
				aria-label='Sign out'
				onClick={handleSignOut}
				data-testid='mobile-nav-sign-out'
				className='size-11 rounded-xl text-muted-foreground'
			>
				<HugeiconsIcon
					icon={Logout01Icon}
					strokeWidth={2}
					className='size-5'
				/>
			</Button>
		</div>
	)
}
