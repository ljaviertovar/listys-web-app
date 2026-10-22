'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserRemove01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmSheet } from '@/components/commons'
import { cn } from '@/utils'
import type { CollaboratorWithProfile } from '@/types'

import { avatarTone, formatCollaboratorRole, getCollaboratorDisplayName } from './helpers/collaborator-display'

interface ShareCollaboratorsProps {
	collaborators: CollaboratorWithProfile[]
	isOwner: boolean
	isLoading: boolean
	/** Resolves to whether the person was removed. */
	onRemove: (userId: string) => Promise<boolean>
}

/** The people who can open the list, with their role; the owner removes one after a confirmation. */
export function ShareCollaborators({ collaborators, isOwner, isLoading, onRemove }: ShareCollaboratorsProps) {
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [removing, setRemoving] = useState(false)

	const remove = async (userId: string) => {
		setRemoving(true)
		const removed = await onRemove(userId)
		setRemoving(false)
		if (removed) setConfirmingId(null)
	}

	return (
		<section
			data-testid='share-collaborators'
			aria-labelledby='share-collaborators-title'
			className='flex flex-col gap-1'
		>
			<div className='flex items-center justify-between gap-2 pb-1'>
				<h3
					id='share-collaborators-title'
					className='font-display text-base leading-[1.4] font-semibold'
				>
					Collaborators
				</h3>
				<span className='inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-slate-100 px-1.5 font-mono text-xs font-semibold text-slate-700 tabular-nums dark:bg-muted dark:text-foreground'>
					{collaborators.length}
				</span>
			</div>

			{isLoading ? (
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-14 w-full rounded-2xl' />
					<Skeleton className='h-14 w-full rounded-2xl' />
				</div>
			) : collaborators.length === 0 ? (
				<p className='py-2 text-sm text-slate-500 dark:text-muted-foreground'>No one else has joined yet.</p>
			) : (
				<ul className='divide-y divide-slate-100 dark:divide-border'>
					{collaborators.map(collaborator => {
						const name = getCollaboratorDisplayName(collaborator.display_name, collaborator.email)
						const confirming = confirmingId === collaborator.user_id

						return (
							<li
								key={collaborator.id}
								data-testid={`share-collaborator-${collaborator.user_id}`}
								className='py-1.5'
							>
								<div className='flex min-h-14 items-center gap-3'>
									<InitialsAvatar
										initials={collaborator.avatar_initials}
										seed={collaborator.user_id}
									/>
									<div className='flex min-w-0 flex-1 flex-col items-start gap-1'>
										<span className='w-full truncate text-sm leading-[1.3] font-semibold'>{name}</span>
										<span
											className={cn(
												'inline-flex h-5.5 items-center rounded-full px-2 text-xs leading-none font-semibold',
												collaborator.role === 'owner'
													? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
													: 'bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground',
											)}
										>
											{formatCollaboratorRole(collaborator.role)}
										</span>
									</div>
									{isOwner && collaborator.role !== 'owner' ? (
										<Button
											type='button'
											aria-label={`Remove ${name}`}
											onClick={() => setConfirmingId(collaborator.user_id)}
											variant='quiet-destructive'
											size='icon-xl'
											className='shrink-0'
										>
											<HugeiconsIcon
												icon={UserRemove01Icon}
												strokeWidth={1.6}
												aria-hidden='true'
												className='size-5'
											/>
										</Button>
									) : null}
								</div>
								{isOwner && collaborator.role !== 'owner' ? (
									<ConfirmSheet
										open={confirming}
										onOpenChange={next => !removing && setConfirmingId(next ? collaborator.user_id : null)}
										title={`Remove ${name}?`}
										description='Access to this list ends right away. They can join again with the link.'
										confirmLabel='Remove'
										loadingLabel='Removing…'
										tone='danger'
										loading={removing}
										onConfirm={() => remove(collaborator.user_id)}
										testId={`share-remove-collaborator-${collaborator.user_id}`}
									/>
								) : null}
							</li>
						)
					})}
				</ul>
			)}
		</section>
	)
}

function InitialsAvatar({ initials, seed }: { initials: string; seed: string }) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
				avatarTone(seed),
			)}
		>
			{initials}
		</span>
	)
}
