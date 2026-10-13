'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Share01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { A1_SECONDARY, A1_TOOLBAR_BUTTON } from '@/components/app/helpers/a1-surface'
import { SheetDialog } from '@/components/commons'
import { cn } from '@/utils'
import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/types'

import { useShareList } from './hooks/use-share-list'
import { ShareCollaborators } from './share-collaborators'
import { ShareInviteLink } from './share-invite-link'

interface Props {
	baseListId: string
	listName: string
	isOwner: boolean
	initialCollaborators?: CollaboratorWithProfile[]
	initialInviteLinks?: InviteLinkWithUrl[]
	className?: string
}

/** "Share": the button and the sheet where the owner of a list creates its invite link and manages who has access. */
export function ShareListDialog({
	baseListId,
	listName,
	isOwner,
	initialCollaborators,
	initialInviteLinks,
	className,
}: Props) {
	const [open, setOpen] = useState(false)
	const share = useShareList({ baseListId, isOwner, initialCollaborators, initialInviteLinks })

	return (
		<SheetDialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (next) share.load()
			}}
			trigger={
				<Button
					variant='outline'
					data-testid='share-list-button'
					className={cn(A1_TOOLBAR_BUTTON, A1_SECONDARY, className)}
				>
					<HugeiconsIcon
						icon={Share01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className='size-[18px]'
					/>
					Share
				</Button>
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
