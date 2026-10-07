'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout01Icon } from '@hugeicons/core-free-icons'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { createClient } from '@/lib/supabase/client'

interface Props {
	user: any
}

export function UserNav({ user }: Props) {
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const handleSignOut = async () => {
		setOpen(false)
		const supabase = createClient()
		await supabase.auth.signOut()
		router.push('/auth/signin')
		router.refresh()
	}

	const userMetadata = user.user_metadata
	const displayName = userMetadata?.name || userMetadata?.full_name || user.email?.split('@')[0] || 'User'
	const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture

	return (
		<DropdownMenu
			open={open}
			onOpenChange={setOpen}
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='relative rounded-full h-10 px-2 py-4'
				>
					<Avatar className='h-8 w-8'>
						<AvatarImage
							src={avatarUrl || '/img/avatars/01.png'}
							alt={displayName}
						/>
						<AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56'
				align='end'
				forceMount
			>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-2'>
						<p className='text-sm font-medium leading-none'>{displayName}</p>
						<p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<div className='flex justify-center py-2'>
					<Button
						variant='secondary'
						size='sm'
						rounded='xl'
						className='w-fit text-xs font-semibold'
						onClick={handleSignOut}
					>
						<HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className='h-4 w-4' />
						Sign Out
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
