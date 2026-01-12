'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'

interface Props {
	user: User
}

export function UserNav({ user }: Props) {
	const router = useRouter()
	const supabase = createClient()

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.push('/auth/signin')
		router.refresh()
	}

	const getInitials = (email: string) => {
		return email.substring(0, 2).toUpperCase()
	}

	return (
		<div className='flex items-center gap-3'>
			<div className='flex flex-col items-end'>
				<p className='text-sm font-medium'>{user.email}</p>
			</div>
			<div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground'>
				<span className='text-xs font-semibold'>{getInitials(user.email ?? 'U')}</span>
			</div>
			<Button
				variant='ghost'
				size='sm'
				onClick={handleSignOut}
			>
				Sign Out
			</Button>
		</div>
	)
}
