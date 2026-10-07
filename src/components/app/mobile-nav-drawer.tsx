'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import Logo from '@/components/commons/logo'
import { SIDEBAR_DATA } from '@/data/constants'
import useActiveSessionStore from '@/stores/active-session'
import { cn } from '@/utils'
import { ActiveShoppingBadge } from './active-session'
import { checkIsActive } from './sidebar/helpers/check-is-active'
import AppSidebarFooter from './sidebar/app-sidebar-footer'

/** Navigation for screens without the persistent sidebar: the same sections, in the same order, in a side sheet. */
export default function MobileNavDrawer() {
	const [open, setOpen] = useState(false)
	const pathname = usePathname()
	const activeSession = useActiveSessionStore(s => s.activeSession)
	const close = () => setOpen(false)

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}
		>
			<SheetTrigger asChild>
				<Button
					variant='ghost'
					size='icon-lg'
					aria-label='Open menu'
					data-testid='mobile-nav-trigger'
					className='size-11 rounded-xl'
				>
					<HugeiconsIcon
						icon={Menu02Icon}
						strokeWidth={2}
						className='size-6'
					/>
				</Button>
			</SheetTrigger>
			<SheetContent
				side='left'
				data-testid='mobile-nav-drawer'
				className='w-[19.5rem] gap-0 rounded-r-2xl p-0'
			>
				<SheetTitle className='sr-only'>Menu</SheetTitle>
				<SheetDescription className='sr-only'>Navigate between the sections of Listys.</SheetDescription>

				<div className='flex h-16 shrink-0 items-center border-b px-5'>
					<Logo />
				</div>

				<nav
					aria-label='Main'
					className='flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5'
				>
					{SIDEBAR_DATA.navGroups.map(group => (
						<div
							key={group.title}
							className='flex flex-col gap-1'
						>
							<span className='px-3 pb-2 text-xs font-medium text-muted-foreground'>
								{group.title}
							</span>
							{group.items.map(item => {
								if (!item.url) return null
								const isActive = checkIsActive(pathname, item)
								return (
									<Link
										key={item.url}
										href={item.url}
										onClick={close}
										aria-current={isActive ? 'page' : undefined}
										data-active={isActive}
										className={cn(
											'relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/80 transition-colors duration-150 hover:bg-muted hover:text-foreground',
											isActive &&
												'bg-primary/10 font-semibold text-primary before:absolute before:inset-y-3 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-primary hover:bg-primary/10 hover:text-primary',
										)}
									>
										{item.icon ? (
											<HugeiconsIcon
												icon={item.icon}
												strokeWidth={2}
												className={cn('size-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
											/>
										) : null}
										{item.title}
									</Link>
								)
							})}
						</div>
					))}
				</nav>

				<div className='flex shrink-0 flex-col gap-1 border-t p-3'>
					{activeSession ? (
						<Link
							href={`/shopping/${activeSession.id}`}
							onClick={close}
							data-testid='mobile-nav-active-session'
							className='flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4'
						>
							<ActiveShoppingBadge />
							<span className='truncate font-display text-sm font-semibold'>{activeSession.name || 'Current shopping'}</span>
						</Link>
					) : null}
					<AppSidebarFooter />
				</div>
			</SheetContent>
		</Sheet>
	)
}
