'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { HugeiconsIcon } from '@hugeicons/react'

import { Menu02Icon } from '@hugeicons/core-free-icons'

import { NAV_APP_ITEMS } from '@/data/constants/nav'
import useActiveSessionStore from '@/stores/active-session'
import { ActiveShoppingBadge } from './active-shopping-badge'
import Logo from '../commons/logo'

export default function MobileMenu() {
	const activeRun = useActiveSessionStore(s => s.activeSession)

	useEffect(() => {
		// keep effect for potential side-effects in future; noop for now
	}, [])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					aria-label='Open menu'
				>
					<HugeiconsIcon
						icon={Menu02Icon}
						strokeWidth={2}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56'>
				{/* Current active shopping run (initial section) */}

				<div className='flex justify-center scale-80'>
					<Logo />
				</div>

				{activeRun ? (
					<>
						<DropdownMenuSeparator />

						<DropdownMenuLabel className='font-medium'>
							<ActiveShoppingBadge />
						</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Link
								href={`/shopping/${activeRun.id}`}
								className='block w-full h-9 leading-9 text-primary font-medium'
							>
								{activeRun.name ? `${activeRun.name}` : 'Unknown'}
							</Link>
						</DropdownMenuItem>
					</>
				) : null}
				<DropdownMenuSeparator />

				<DropdownMenuLabel className='font-medium'>Navigate</DropdownMenuLabel>
				{NAV_APP_ITEMS.map(item => (
					<DropdownMenuItem
						key={item.url}
						asChild
					>
						<Link
							href={item.url}
							className='flex h-9 w-full items-center gap-2'
						>
							{item.icon && (
								<HugeiconsIcon
									icon={item.icon}
									strokeWidth={2}
									className='h-4 w-4'
								/>
							)}
							{item.title}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
