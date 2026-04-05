'use client'

import { useState, useTransition } from 'react'
import { Copy01Icon, Delete02Icon, LinkSquare02Icon, Share01Icon, UserRemoveIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import type { CollaboratorWithProfile, InviteLinkWithUrl } from '@/features/sharing/types'
import {
	formatCollaboratorRole,
	getCollaboratorDisplayName,
	getCollaboratorsEmptyStateMessage,
} from '@/components/features/sharing/share-list-dialog.utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { AlertDialogMedia } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface Props {
	baseListId: string
	listName: string
	isOwner: boolean
	initialCollaborators?: CollaboratorWithProfile[]
	initialInviteLinks?: InviteLinkWithUrl[]
	className?: string
}

export function ShareListDialog({
	baseListId,
	listName,
	isOwner,
	initialCollaborators = [],
	initialInviteLinks = [],
	className,
}: Props) {
	const [open, setOpen] = useState(false)
	const [collaborators, setCollaborators] = useState<CollaboratorWithProfile[]>(initialCollaborators)
	const [inviteLinks, setInviteLinks] = useState<InviteLinkWithUrl[]>(initialInviteLinks)
	const [isPending, startTransition] = useTransition()
	const [isRegenerating, setIsRegenerating] = useState(false)
	const [copied, setCopied] = useState(false)
	const { toast } = useToast()

	function handleOpenChange(next: boolean) {
		setOpen(next)
		if (next) {
			fetchData()
		}
	}

	function fetchData() {
		startTransition(async () => {
			const [collabRes, linksRes] = await Promise.all([
				fetch(`/api/v1/base-lists/${baseListId}/collaborators`),
				isOwner ? fetch(`/api/v1/base-lists/${baseListId}/invites`) : Promise.resolve(null),
			])

			if (collabRes.ok) {
				const { data } = await collabRes.json()
				setCollaborators(data ?? [])
			}

			if (linksRes?.ok) {
				const { data } = await linksRes.json()
				setInviteLinks(data ?? [])
			}
		})
	}

	async function handleGenerateLink() {
		setIsRegenerating(true)
		try {
			const res = await fetch(`/api/v1/base-lists/${baseListId}/invites`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			})

			if (!res.ok) {
				toast({ title: 'Failed to generate link', variant: 'destructive' })
				return
			}

			const { data } = await res.json()
			setInviteLinks([data]) // replace all — only one active link at a time
		} finally {
			setIsRegenerating(false)
		}
	}

	async function handleCopyLink(inviteUrl: string) {
		await navigator.clipboard.writeText(inviteUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	async function handleRevokeLink(inviteId: string) {
		const res = await fetch(`/api/v1/base-lists/${baseListId}/invites/${inviteId}`, { method: 'DELETE' })

		if (!res.ok) {
			toast({ title: 'Failed to revoke link', variant: 'destructive' })
			return
		}

		setInviteLinks(prev => prev.filter(link => link.id !== inviteId))
	}

	async function handleRemoveCollaborator(userId: string) {
		const res = await fetch(`/api/v1/base-lists/${baseListId}/collaborators/${userId}`, { method: 'DELETE' })

		if (!res.ok) {
			toast({ title: 'Failed to remove collaborator', variant: 'destructive' })
			return
		}

		setCollaborators(prev => prev.filter(collaborator => collaborator.user_id !== userId))
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className={className ?? 'w-full gap-2'}
				>
					<HugeiconsIcon
						icon={Share01Icon}
						className='h-4 w-4'
					/>
					Share
				</Button>
			</DialogTrigger>

			<DialogContent
				onOpenAutoFocus={e => e.preventDefault()}
				className='w-11/12 sm:max-w-md'
			>
				<DialogHeader className='items-center gap-1.5 pr-8'>
					<AlertDialogMedia className='rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'>
						<HugeiconsIcon
							icon={Share01Icon}
							strokeWidth={2}
							className='h-4 w-4'
						/>
					</AlertDialogMedia>
					<DialogTitle className='truncate font-bold tracking-tight text-foreground'>Share "{listName}"</DialogTitle>
					<DialogDescription>Invite collaborators to view and edit this list together.</DialogDescription>
				</DialogHeader>

				<div className='max-h-[70vh] space-y-6 overflow-y-auto pr-1'>
					{isOwner && (
						<section className='space-y-3'>
							<div className='flex items-start justify-between gap-3'>
								<div className='space-y-1'>
									<p className='text-sm font-medium'>Invite link</p>
									<p className='text-sm text-muted-foreground'>
										Create a private link so someone can join this shared list instantly.
									</p>
								</div>
								{inviteLinks.length === 0 && (
									<Button
										size='sm'
										variant='outline'
										onClick={handleGenerateLink}
										disabled={isPending}
										className='shrink-0'
									>
										<HugeiconsIcon
											icon={LinkSquare02Icon}
											className='h-3.5 w-3.5'
										/>
										Generate link
									</Button>
								)}
							</div>
							{isPending ? (
								<div className='space-y-2'>
									<Skeleton className='h-16 w-full rounded-lg' />
									<Skeleton className='h-16 w-full rounded-lg' />
								</div>
							) : inviteLinks.length === 0 ? (
								<p className='text-xs text-muted-foreground'>
									No active invite links yet. Generate one when you are ready to invite someone.
								</p>
							) : (
								<div className='space-y-3 rounded-lg border bg-muted/40 px-3 py-3'>
									<div className='overflow-hidden rounded-md border bg-background'>
										<div className='overflow-x-auto px-3 py-2'>
											<p className='w-max min-w-full font-mono text-xs text-muted-foreground'>
												{inviteLinks[0].invite_url}
											</p>
										</div>
									</div>
									<div className='flex items-center justify-end gap-2'>
										<Button
											size='sm'
											title='Copy link'
											onClick={() => handleCopyLink(inviteLinks[0].invite_url)}
											disabled={copied}
										>
											{copied ? (
												'Copied!'
											) : (
												<>
													<HugeiconsIcon
														icon={Copy01Icon}
														className='h-3.5 w-3.5'
													/>
													Copy
												</>
											)}
										</Button>
										<Button
											size='sm'
											variant='outline'
											title='Regenerate link'
											onClick={handleGenerateLink}
											disabled={isRegenerating || isPending}
										>
											{isRegenerating ? (
												<span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
											) : (
												<HugeiconsIcon
													icon={LinkSquare02Icon}
													className='h-3.5 w-3.5'
												/>
											)}
											{isRegenerating ? 'Generating...' : 'Regenerate'}
										</Button>
										<Button
											size='sm'
											variant='ghost'
											className='text-destructive hover:text-destructive'
											title='Revoke link'
											onClick={() => handleRevokeLink(inviteLinks[0].id)}
										>
											<HugeiconsIcon
												icon={Delete02Icon}
												className='h-3.5 w-3.5'
											/>
											Revoke
										</Button>
									</div>
								</div>
							)}
						</section>
					)}

					{isOwner && <Separator />}

					<section className='space-y-3'>
						<div className='space-y-1'>
							<p className='text-sm font-medium'>
								Collaborators {collaborators.length > 0 ? `(${collaborators.length})` : ''}
							</p>
							<p className='text-sm text-muted-foreground'>People who already have access to this list.</p>
						</div>

						{isPending ? (
							<div className='space-y-2'>
								{[...Array(2)].map((_, index) => (
									<Skeleton
										key={index}
										className='h-14 w-full rounded-lg'
									/>
								))}
							</div>
						) : collaborators.length === 0 ? (
							<p className='text-xs text-muted-foreground'>
								{getCollaboratorsEmptyStateMessage({
									isOwner,
									inviteLinksCount: inviteLinks.length,
								})}
							</p>
						) : (
							<ul className='space-y-2'>
								{collaborators.map(collaborator => (
									<li
										key={collaborator.id}
										className='flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2'
									>
										<Avatar size='sm'>
											<AvatarFallback className='text-[10px] font-bold uppercase'>
												{collaborator.avatar_initials}
											</AvatarFallback>
										</Avatar>
										<div className='min-w-0 flex-1'>
											<p className='truncate text-sm font-medium'>
												{getCollaboratorDisplayName(collaborator.display_name, collaborator.email)}
											</p>
											<p className='truncate text-[11px] uppercase tracking-wide text-muted-foreground'>
												{formatCollaboratorRole(collaborator.role)}
												{collaborator.email ? ` • ${collaborator.email}` : ''}
											</p>
										</div>
										{isOwner && (
											<Button
												size='icon'
												variant='ghost'
												className='h-8 w-8 shrink-0 text-destructive hover:text-destructive'
												title='Remove collaborator'
												onClick={() => handleRemoveCollaborator(collaborator.user_id)}
											>
												<HugeiconsIcon
													icon={UserRemoveIcon}
													className='h-3.5 w-3.5'
												/>
											</Button>
										)}
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			</DialogContent>
		</Dialog>
	)
}
