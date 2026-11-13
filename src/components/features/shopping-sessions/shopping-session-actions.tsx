'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Attachment01Icon, Cancel01Icon, CheckmarkCircle02Icon, PlusSignIcon, Share01Icon, ShoppingBag03Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { AddItemSheet } from '@/components/features/list-items'
import { ShareListDialog } from '@/components/features/sharing'
import { UploadTicketDialog } from '@/components/features/tickets'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ABOVE_MOBILE_TAB_BAR } from '@/components/app/helpers/mobile-tab-bar-layout'
import { cn } from '@/utils'

import { CancelSessionSheet } from './cancel-session-sheet'
import { CompleteSessionSheet } from './complete-session-sheet'
import { useTripSync } from './hooks/use-trip-sync'
import { visibleTripItems } from './sync/trip-sync-state'
import { itemsForSessionProgress } from './helpers/split-session-sections'

interface ShoppingSessionActionsProps {
	sessionId: string
	checked: number
	total: number
	baseListId?: string | null
	listName: string
	storeId?: string | null
	/** Only the owner of the list can complete or cancel its session. */
	isOwner?: boolean
	/** Only the person who started the trip can attach its receipts. */
	canAttachReceipt?: boolean
}

/**
 * Session actions stay in the floating phone menu and desktop header; item and sharing sheets open from the menu or desktop toolbar.
 */
export function ShoppingSessionActions({ sessionId, checked, total, baseListId, listName, storeId, isOwner = false, canAttachReceipt = false }: ShoppingSessionActionsProps) {
	const { state } = useTripSync(sessionId)
	if (state.initialized) {
		const items = itemsForSessionProgress(visibleTripItems(state), Boolean(storeId))
		checked = items.filter(item => item.checked).length
		total = items.length
	}
	const [menuOpen, setMenuOpen] = useState(false)
	const [completeOpen, setCompleteOpen] = useState(false)
	const [cancelOpen, setCancelOpen] = useState(false)
	const [shareOpen, setShareOpen] = useState(false)
	const [addItemOpen, setAddItemOpen] = useState(false)
	const [receiptOpen, setReceiptOpen] = useState(false)

	return (
		<>
			{isOwner ? <div
				data-testid='session-actions-inline'
				className='hidden items-center gap-2 lg:flex'
			>
				<Button
					size='primary'
					variant='destructive-soft'
					onClick={() => setCancelOpen(true)}
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					Cancel Shopping
				</Button>
				<Button
					size='primary'
					onClick={() => setCompleteOpen(true)}
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					Complete Shopping
				</Button>
			</div> : null}

			<div
				data-testid='session-actions-floating'
				className={cn('fixed right-4 z-40 mb-4 lg:hidden', ABOVE_MOBILE_TAB_BAR)}
			>
				<DropdownMenu
					open={menuOpen}
					onOpenChange={setMenuOpen}
				>
					<DropdownMenuTrigger asChild>
						<Button
							type='button'
							data-testid='session-actions-button'
							aria-label='Actions'
							variant='floating'
							size='icon-xl'
							rounded='full'
						>
							<HugeiconsIcon
								icon={ShoppingBag03Icon}
								strokeWidth={1.5}
								aria-hidden='true'
								className='size-4.5'
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side='top'
						align='end'
						sideOffset={8}
						variant='menu'
						className='w-58'
					>
						{isOwner && baseListId ? <DropdownMenuItem onSelect={() => setShareOpen(true)} size='touch'>
							<HugeiconsIcon icon={Share01Icon} strokeWidth={1.8} aria-hidden='true' className='size-5' />
							Share
						</DropdownMenuItem> : null}
						<DropdownMenuItem onSelect={() => setAddItemOpen(true)} size='touch'>
							<HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.8} aria-hidden='true' className='size-5' />
							Add Item
						</DropdownMenuItem>
						{canAttachReceipt ? <DropdownMenuItem onSelect={() => setReceiptOpen(true)} size='touch'>
							<HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.8} aria-hidden='true' className='size-5' />
							Attach Receipt
						</DropdownMenuItem> : null}
						{isOwner ? <>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onSelect={() => setCompleteOpen(true)}
							size='touch'
						>
							<HugeiconsIcon
								icon={CheckmarkCircle02Icon}
								strokeWidth={1.6}
								aria-hidden='true'
								className='size-5'
							/>
							Complete Shopping
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onSelect={() => setCancelOpen(true)}
							variant='destructive'
							size='touch'
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-5'
							/>
							Cancel Shopping
						</DropdownMenuItem>
						</> : null}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			{isOwner && baseListId ? <ShareListDialog baseListId={baseListId} listName={listName} isOwner={isOwner} trigger={null} open={shareOpen} onOpenChange={setShareOpen} /> : null}
			<AddItemSheet target={{ context: 'shopping-session', sessionId }} trigger={null} open={addItemOpen} onOpenChange={setAddItemOpen} />
			{canAttachReceipt ? <UploadTicketDialog trigger={null} open={receiptOpen} onOpenChange={setReceiptOpen} shoppingSessionId={sessionId} /> : null}

			{isOwner ? <><CompleteSessionSheet
				sessionId={sessionId}
				checked={checked}
				total={total}
				open={completeOpen}
				onOpenChange={setCompleteOpen}
			/>
			<CancelSessionSheet
				sessionId={sessionId}
				listName={listName}
				checked={checked}
				total={total}
				open={cancelOpen}
				onOpenChange={setCancelOpen}
			/>
			</> : null}
		</>
	)
}
