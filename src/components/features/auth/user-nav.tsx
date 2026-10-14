'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { ArrowDown01Icon, Logout01Icon } from '@hugeicons/core-free-icons'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { USER_NAV_ITEMS } from '@/data/constants'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/utils'
import { AccountMenuScrim } from './account-menu-scrim'
import { summarizeUser, type UserLike } from './helpers/summarize-user'

interface Props {
	user: UserLike
}

// Keep Dashboard, Profile and Account available in the account menu at every breakpoint.
// Each row is a grey icon tile and a regular 14px title (design A1 mobile).
const MENU_ROW_TILE = 'bg-background text-slate-600 dark:bg-muted dark:text-muted-foreground'
const MENU_URLS = ['/dashboard', '/settings/profile', '/settings/account']
const MENU_LINKS = USER_NAV_ITEMS.filter(item => MENU_URLS.includes(item.url))


function RowTile({ icon, className }: { icon: IconSvgElement; className: string }) {
	return (
		<span
			aria-hidden='true'
			className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', className)}
		>
			<HugeiconsIcon
				icon={icon}
				strokeWidth={1.5}
				className='size-5'
			/>
		</span>
	)
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
				{/* Phones: a 44px circle around the avatar, on the secondary surface while the menu is open. From `lg`: a pill with name, email and a chevron. */}
				<Button
					variant='ghost'
					size='avatar'
					rounded='full'
					aria-label='Account menu'
					data-testid='user-nav-trigger'
				>
					<Avatar size='md'>
						{avatarUrl ? (
							<AvatarImage
								src={avatarUrl}
								alt=''
							/>
						) : null}
						<AvatarFallback tone='soft'>
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className='hidden flex-col items-start gap-0.5 text-left lg:flex'>
						<span className='text-sm leading-[1.1] font-semibold'>{displayName}</span>
						<span className='text-xs leading-[1.1] font-normal text-muted-foreground'>{user.email}</span>
					</span>
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='hidden size-4 text-slate-500 lg:block'
					/>
				</Button>
			</DropdownMenuTrigger>
			{open ? <AccountMenuScrim /> : null}
			<DropdownMenuContent
				// 263px wide on phones (design A1 mobile); the account variant brings the radius, the overlay shadow and no ring.
				variant='account'
				className='w-[263px] max-w-[calc(100vw-1rem)]'
				align='end'
				sideOffset={12}
				forceMount
			>
				<DropdownMenuLabel
					data-testid='user-nav-identity'
					variant='identity'
				>
					<Avatar size='xl'>
						{avatarUrl ? (
							<AvatarImage
								src={avatarUrl}
								alt=''
							/>
						) : null}
						<AvatarFallback tone='soft'>
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className='flex min-w-0 flex-col gap-1'>
						<span className='truncate font-display text-base leading-[1.2] font-bold text-foreground'>{displayName}</span>
						<span className='truncate text-xs leading-[1.3] text-slate-500 dark:text-muted-foreground'>{user.email}</span>
					</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator
					variant='solid'
					className='mx-2.5 mt-0 mb-1'
				/>

				<DropdownMenuGroup>
					{MENU_LINKS.map(item => {
						return (
							<DropdownMenuItem
								key={item.url}
								asChild
								size='row'
							>
								<Link
									href={item.url}
									data-testid={`user-nav-link-${item.url.split('/').pop()}`}
								>
									{item.icon ? (
										<RowTile
											icon={item.icon}
											className={MENU_ROW_TILE}
										/>
									) : null}
									<span className='text-sm leading-[1.2] font-normal'>{item.title}</span>
								</Link>
							</DropdownMenuItem>
						)
					})}
				</DropdownMenuGroup>
				<DropdownMenuSeparator
					variant='solid'
					className='mx-2.5 mt-1 mb-2'
				/>

				<DropdownMenuItem
					onSelect={handleSignOut}
					data-testid='user-nav-sign-out'
					size='action'
				>
					<HugeiconsIcon
						icon={Logout01Icon}
						strokeWidth={1.5}
						className='size-4.5'
					/>
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
