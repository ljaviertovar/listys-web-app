'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'

export default function MobileMenu() {
	const [activeRun, setActiveRun] = useState<{ id: string; name?: string } | null>(null)

	useEffect(() => {
		let mounted = true
		const supabase = createClient()

		const load = async () => {
			const { data: userData } = await supabase.auth.getUser()
			const user = userData?.user
			if (!user) return

			const { data: run } = await supabase
				.from('shopping_runs')
				.select('id, name')
				.eq('user_id', user.id)
				.eq('status', 'active')
				.maybeSingle()

			if (mounted && run) setActiveRun({ id: run.id, name: run.name })
		}

		load()
		return () => {
			mounted = false
		}
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
				{activeRun ? (
					<>
						<DropdownMenuLabel className='font-medium'>Shopping</DropdownMenuLabel>
						<DropdownMenuSeparator />
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

				<DropdownMenuLabel className='font-medium'>Navigate</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{NAV_APP_ITEMS.map(item => (
					<DropdownMenuItem
						key={item.url}
						asChild
					>
						<Link
							href={item.url}
							className='block w-full h-9 leading-9'
						>
							{item.title}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
