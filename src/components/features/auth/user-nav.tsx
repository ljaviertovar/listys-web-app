'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { NavItem } from '@/types'
import { USER_NAV_ITEMS } from '@/data/constants/nav'
import { createClient } from '@/lib/supabase/client'

interface Props {
	user: any
}

const UserNavItem = ({ title, url }: NavItem) => {
	return (
		<DropdownMenuItem>
			<Link
				className='block w-full h-6 text-sm text-left'
				href={url}
			>
				{title}
			</Link>
		</DropdownMenuItem>
	)
}

export function UserNav({ user }: Props) {
	const router = useRouter()

	const handleSignOut = async () => {
		const supabase = createClient()
		await supabase.auth.signOut()
		router.push('/auth/signin')
		router.refresh()
	}

	const userMetadata = user.user_metadata
	const displayName = userMetadata?.name || userMetadata?.full_name || user.email?.split('@')[0] || 'User'
	const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture

	return (
		<DropdownMenu>
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
					User
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

				{USER_NAV_ITEMS.map(item => (
					<UserNavItem
						key={item.url}
						title={item.title}
						url={item.url}
					/>
				))}

				<DropdownMenuSeparator />

				<DropdownMenuItem>
					<Button
						variant={'ghost'}
						size={'sm'}
						className='w-full h-6'
						onClick={handleSignOut}
					>
						Sign Out
					</Button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
