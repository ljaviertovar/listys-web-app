'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Share08Icon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { SheetDialog } from '@/components/commons'
import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/types'

import { useShareList } from './hooks/use-share-list'
import { ShareCollaborators } from './share-collaborators'
import { ShareInviteLink } from './share-invite-link'

/** The trigger is a regular `Button` (`size`, `variant`, `className`… go straight to it). */
interface Props extends Omit<ButtonProps, 'children'> {
	baseListId: string
	listName: string
	isOwner: boolean
	initialCollaborators?: CollaboratorWithProfile[]
	initialInviteLinks?: InviteLinkWithUrl[]
	/** Controls the sheet from outside (a menu item); `trigger={null}` then leaves out the button. Without them it manages itself. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	trigger?: null
}

/** "Share": the button and the sheet where the owner of a list creates its invite link and manages who has access. */
export function ShareListDialog({
	baseListId,
	listName,
	isOwner,
	initialCollaborators,
	initialInviteLinks,
	open: controlledOpen,
	onOpenChange,
	trigger,
	...buttonProps
}: Props) {
	const [ownOpen, setOwnOpen] = useState(false)
	const open = controlledOpen ?? ownOpen
	const setOpen = onOpenChange ?? setOwnOpen
	const share = useShareList({ baseListId, isOwner, initialCollaborators, initialInviteLinks })

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (next) share.load()
			}}
			trigger={
				trigger === null ? undefined : (
					<Button
					variant='outline-surface'
					size='primary'
					{...buttonProps}
					data-testid='share-list-button'
				>
					<HugeiconsIcon
						icon={Share08Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-4.5'
					/>
					Share
				</Button>
				)
			}
			title={`Share “${listName}”`}
			description='Invite people to view and edit this list together.'
			testId='share-list-sheet'
		>
			<div className='flex max-h-[70dvh] flex-col gap-6 overflow-y-auto'>
				{isOwner ? (
					<ShareInviteLink
						link={share.inviteLinks[0]}
						isLoading={share.isLoading}
						isGenerating={share.isGenerating}
						onGenerate={share.generateLink}
						onRevoke={share.revokeLink}
					/>
				) : null}
				<ShareCollaborators
					collaborators={share.collaborators}
					isOwner={isOwner}
					isLoading={share.isLoading}
					onRemove={share.removeCollaborator}
				/>
			</div>
		</SheetDialog>
	)
}
