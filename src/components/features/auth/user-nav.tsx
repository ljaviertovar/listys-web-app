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
import { summarizeUser } from './helpers/summarize-user'

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

	const { name: displayName, initials, avatarUrl } = summarizeUser(user)

	return (
		<DropdownMenu
			open={open}
			onOpenChange={setOpen}
		>
			<DropdownMenuTrigger asChild>
				{/* A pill (design A1): the avatar on phones, the avatar with name and email from `lg`. 44px high either way. */}
				<Button
					variant='ghost'
					aria-label='Account menu'
					data-testid='user-nav-trigger'
					className='h-11 gap-2.5 rounded-full border border-transparent py-0 pr-2 pl-1 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-border dark:hover:bg-muted'
				>
					<Avatar className='size-[34px]'>
						{avatarUrl ? (
							<AvatarImage
								src={avatarUrl}
								alt=''
							/>
						) : null}
						<AvatarFallback className='bg-blue-100 text-[13px] font-bold text-blue-700 dark:bg-primary/20 dark:text-primary'>
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className='hidden flex-col items-start gap-0.5 text-left lg:flex'>
						<span className='text-[13.5px] leading-[1.1] font-semibold'>{displayName}</span>
						<span className='text-xs leading-[1.1] font-normal text-muted-foreground'>{user.email}</span>
					</span>
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
