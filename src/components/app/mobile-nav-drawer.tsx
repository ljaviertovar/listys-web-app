'use client'

import { useState } from 'react'
import { Cancel01Icon, Menu02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import Logo from '@/components/commons/logo'
import { MobileNavPanel } from './mobile-nav-panel'

/** Navigation for screens without the persistent sidebar: the same sections, in the same order, in a side sheet. */
export default function MobileNavDrawer() {
	const [open, setOpen] = useState(false)

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
				// The sheet's own `data-[side=left]:w-3/4` would win over a plain width, so the width is set on the same variant.
				// Reference menu: 312px wide, 24px right corners, a long soft shadow, and an ink scrim at 45% instead of black at 80%.
				className='gap-0 rounded-r-3xl p-0 shadow-[24px_0_48px_-24px_rgba(15,23,42,0.45)] data-[side=left]:w-[19.5rem]'
				overlayClassName='bg-slate-900/45'
				showCloseButton={false}
			>
				<SheetTitle className='sr-only'>Menu</SheetTitle>
				<SheetDescription className='sr-only'>Navigate between the sections of Listys.</SheetDescription>

				<div className='flex h-16 shrink-0 items-center justify-between border-b pr-2 pl-5'>
					<Logo />
					<SheetClose asChild>
						<Button
							variant='ghost'
							aria-label='Close menu'
							className='size-11 rounded-xl text-slate-700'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={2}
								className='size-5'
							/>
						</Button>
					</SheetClose>
				</div>

				<MobileNavPanel
					open={open}
					onNavigate={() => setOpen(false)}
				/>
			</SheetContent>
		</Sheet>
	)
}
