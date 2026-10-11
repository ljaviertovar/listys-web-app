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

// Phones have no sidebar, so the account menu is where Dashboard, Profile and Account live; from `lg` the sidebar has them.
// Each row is a grey icon tile and a regular 14px title (design A1 mobile).
const MENU_ROW_TILE = 'bg-[#F2F4F7] text-slate-600 dark:bg-muted dark:text-muted-foreground'
const MENU_URLS = ['/dashboard', '/settings/profile', '/settings/account']
const MENU_LINKS = USER_NAV_ITEMS.filter(item => MENU_URLS.includes(item.url))

const MENU_ROW = 'min-h-[52px] gap-3 rounded-[14px] px-2.5 py-2 focus:bg-[#F2F4F7] dark:focus:bg-muted'

function RowTile({ icon, className }: { icon: IconSvgElement; className: string }) {
	return (
		<span
			aria-hidden='true'
			className={cn('flex size-9 shrink-0 items-center justify-center rounded-[12px]', className)}
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
					aria-label='Account menu'
					data-testid='user-nav-trigger'
					className='size-11 gap-0 rounded-full border-0 p-0 hover:bg-[#E9ECF0] data-[state=open]:bg-[#E9ECF0] lg:h-11 lg:w-auto lg:gap-2.5 lg:pr-2 lg:pl-1 dark:hover:bg-muted dark:data-[state=open]:bg-muted'
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
				// 4px under the 60px header on phones; 263px wide, 20px radius, an overlay shadow and no ring (design A1 mobile).
				className='w-[263px] max-w-[calc(100vw-1rem)] rounded-[20px] bg-card p-2 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.35)] ring-0'
				align='end'
				sideOffset={12}
				forceMount
			>
				<DropdownMenuLabel
					data-testid='user-nav-identity'
					className='flex items-center gap-3 px-2.5 pt-2.5 pb-3 font-normal'
				>
					<Avatar className='size-11'>
						{avatarUrl ? (
							<AvatarImage
								src={avatarUrl}
								alt=''
							/>
						) : null}
						<AvatarFallback className='bg-blue-100 text-[15px] font-bold text-blue-700 dark:bg-primary/20 dark:text-primary'>
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className='flex min-w-0 flex-col gap-[3px]'>
						<span className='truncate font-display text-[15px] leading-[1.2] font-bold tracking-[-0.01em] text-foreground'>{displayName}</span>
						<span className='truncate text-[13px] leading-[1.3] text-slate-500 dark:text-muted-foreground'>{user.email}</span>
					</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator className='mx-2.5 mt-0 mb-1 bg-[#EEF0F3] dark:bg-border' />

				<DropdownMenuGroup className='lg:hidden'>
					{MENU_LINKS.map(item => {
						return (
							<DropdownMenuItem
								key={item.url}
								asChild
								className={MENU_ROW}
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
				<DropdownMenuSeparator className='mx-2.5 mt-1 mb-2 bg-[#EEF0F3] lg:hidden dark:bg-border' />

				<DropdownMenuItem
					onSelect={handleSignOut}
					data-testid='user-nav-sign-out'
					className='mx-0.5 mb-0.5 min-h-11 justify-center gap-2 rounded-[12px] bg-[#E9ECF0] font-display text-sm font-semibold hover:bg-[#DEE2E8] focus:bg-[#DEE2E8] dark:bg-muted dark:focus:bg-muted/70'
				>
					<HugeiconsIcon
						icon={Logout01Icon}
						strokeWidth={1.5}
						className='size-[18px]'
					/>
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
