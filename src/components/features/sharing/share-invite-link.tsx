'use client'

import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	Copy01Icon,
	Delete02Icon,
	Link01Icon,
	Loading03Icon,
	Refresh04Icon,
	Tick02Icon,
} from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmSheet } from '@/components/commons'
import { cn } from '@/utils'
import type { InviteLinkWithUrl } from '@/types'

interface ShareInviteLinkProps {
	link: InviteLinkWithUrl | undefined
	isLoading: boolean
	isGenerating: boolean
	onGenerate: () => Promise<void>
	/** Resolves to whether the link was revoked. */
	onRevoke: (inviteId: string) => Promise<boolean>
}

/** The invite link of a shared list: create it, copy it, regenerate it or revoke it (after a confirmation in place). */
export function ShareInviteLink({ link, isLoading, isGenerating, onGenerate, onRevoke }: ShareInviteLinkProps) {
	const [copied, setCopied] = useState(false)
	const [confirmingRevoke, setConfirmingRevoke] = useState(false)
	const [revoking, setRevoking] = useState(false)
	const createLinkRef = useRef<HTMLButtonElement>(null)
	const hadLink = useRef(Boolean(link))

	useEffect(() => {
		if (!copied) return
		const timer = setTimeout(() => setCopied(false), 2000)
		return () => clearTimeout(timer)
	}, [copied])

	useEffect(() => {
		if (hadLink.current && !link && !isLoading) createLinkRef.current?.focus()
		hadLink.current = Boolean(link)
	}, [isLoading, link])

	const copy = async () => {
		if (!link) return
		await navigator.clipboard.writeText(link.invite_url)
		setCopied(true)
	}

	const revoke = async () => {
		if (!link) return
		setRevoking(true)
		const revoked = await onRevoke(link.id)
		setRevoking(false)
		if (revoked) setConfirmingRevoke(false)
	}

	return (
		<section
			data-testid='share-invite-link'
			aria-labelledby='share-invite-title'
			className='flex flex-col gap-3'
		>
			<div className='flex flex-col gap-1'>
				<h3
					id='share-invite-title'
					className='font-display text-base leading-[1.4] font-semibold'
				>
					Invite link
				</h3>
				<p className='text-sm leading-normal text-slate-500 dark:text-muted-foreground'>
					{link
						? 'Anyone with this link can join and edit this list.'
						: 'Create a private link so anyone you send it to can join this list.'}
				</p>
			</div>

			{isLoading ? (
				<Skeleton className='h-12 w-full rounded-2xl' />
			) : !link ? (
				<Button
					ref={createLinkRef}
					size='primary'
					onClick={onGenerate}
					disabled={isGenerating}
					data-testid='share-create-link'
				>
					<HugeiconsIcon
						icon={isGenerating ? Loading03Icon : Link01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className={cn('size-4.5', isGenerating && 'animate-spin motion-reduce:animate-none')}
					/>
					{isGenerating ? 'Creating…' : 'Create Link'}
				</Button>
			) : (
				<>
					<div className='flex h-12 items-center gap-2.5 rounded-2xl bg-muted px-3.5 dark:bg-muted'>
						<HugeiconsIcon
							icon={Link01Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-4.5 shrink-0 text-slate-500'
						/>
						<span
							data-testid='share-link-url'
							title={link.invite_url}
							className='min-w-0 flex-1 truncate font-mono text-xs font-medium'
						>
							{link.invite_url}
						</span>
					</div>
					<Button
						size='primary'
						variant={copied ? 'success-soft' : 'default'}
						onClick={copy}
						data-testid='share-copy-link'
					>
						<HugeiconsIcon
							icon={copied ? Tick02Icon : Copy01Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-4.5'
						/>
						<span aria-live='polite'>{copied ? 'Link Copied' : 'Copy Link'}</span>
					</Button>
					<div className='grid grid-cols-2 gap-3'>
						<Button
							size='primary'
							variant='secondary'
							onClick={onGenerate}
							disabled={isGenerating}
							data-testid='share-regenerate-link'
						>
							<HugeiconsIcon
								icon={Refresh04Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className={cn('size-4.5', isGenerating && 'animate-spin motion-reduce:animate-none')}
							/>
							Regenerate
						</Button>
						<Button
							size='primary'
							variant='destructive-soft'
							onClick={() => setConfirmingRevoke(true)}
							data-testid='share-revoke-link'
						>
							<HugeiconsIcon
								icon={Delete02Icon}
								strokeWidth={1.8}
								aria-hidden='true'
								className='size-4.5'
							/>
							Revoke
						</Button>
					</div>
				</>
			)}
			{link ? (
				<ConfirmSheet
					open={confirmingRevoke}
					onOpenChange={next => !revoking && setConfirmingRevoke(next)}
					title='Revoke this link?'
					description='Nobody can join with it anymore. People who already joined keep their access until you remove them. You can create a new link at any time.'
					confirmLabel='Revoke Link'
					loadingLabel='Revoking…'
					tone='danger'
					loading={revoking}
					onConfirm={revoke}
					testId='share-revoke-confirm'
				/>
			) : null}
		</section>
	)
}
