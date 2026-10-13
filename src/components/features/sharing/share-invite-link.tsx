'use client'

import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
	AlertCircleIcon,
	Copy01Icon,
	Delete02Icon,
	Link01Icon,
	Loading03Icon,
	Refresh04Icon,
	Tick02Icon,
} from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { A1_ACTION, A1_DANGER, A1_SECONDARY } from '@/components/app/helpers/a1-surface'
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

	useEffect(() => {
		if (!copied) return
		const timer = setTimeout(() => setCopied(false), 2000)
		return () => clearTimeout(timer)
	}, [copied])

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
				<Skeleton className='h-12 w-full rounded-[16px]' />
			) : !link ? (
				<Button
					onClick={onGenerate}
					disabled={isGenerating}
					data-testid='share-create-link'
					className={A1_ACTION}
				>
					<HugeiconsIcon
						icon={isGenerating ? Loading03Icon : Link01Icon}
						strokeWidth={1.8}
						aria-hidden='true'
						className={cn('size-[18px]', isGenerating && 'animate-spin motion-reduce:animate-none')}
					/>
					{isGenerating ? 'Creating…' : 'Create Link'}
				</Button>
			) : (
				<>
					<div className='flex h-12 items-center gap-2.5 rounded-[16px] bg-[#F6F7F9] px-3.5 dark:bg-muted'>
						<HugeiconsIcon
							icon={Link01Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-[18px] shrink-0 text-slate-500'
						/>
						<span
							data-testid='share-link-url'
							title={link.invite_url}
							className='min-w-0 flex-1 truncate font-mono text-[13px] font-medium'
						>
							{link.invite_url}
						</span>
					</div>
					<Button
						onClick={copy}
						data-testid='share-copy-link'
						className={cn(
							A1_ACTION,
							copied && 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-300',
						)}
					>
						<HugeiconsIcon
							icon={copied ? Tick02Icon : Copy01Icon}
							strokeWidth={1.8}
							aria-hidden='true'
							className='size-[18px]'
						/>
						<span aria-live='polite'>{copied ? 'Link Copied' : 'Copy Link'}</span>
					</Button>
					{confirmingRevoke ? (
						<div
							role='alertdialog'
							aria-labelledby='share-revoke-title'
							data-testid='share-revoke-confirm'
							className='flex flex-col gap-3 rounded-[20px] bg-red-50 p-3.5 text-red-900 dark:bg-red-950/40 dark:text-red-200'
						>
							<div className='flex items-start gap-3'>
								<HugeiconsIcon
									icon={AlertCircleIcon}
									strokeWidth={1.6}
									aria-hidden='true'
									className='mt-px size-5 shrink-0'
								/>
								<div className='flex flex-col gap-1'>
									<p
										id='share-revoke-title'
										className='text-sm leading-[1.3] font-semibold'
									>
										Revoke this link?
									</p>
									<p className='text-[13.5px] leading-normal'>
										Nobody can join with it anymore. People who already joined keep their access until you remove them. You can
										create a new link at any time.
									</p>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-3'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setConfirmingRevoke(false)}
									disabled={revoking}
									className={cn(A1_ACTION, A1_SECONDARY)}
								>
									Cancel
								</Button>
								<Button
									type='button'
									onClick={revoke}
									disabled={revoking}
									data-testid='share-revoke-confirm-button'
									className={cn(A1_ACTION, A1_DANGER)}
								>
									{revoking ? 'Revoking…' : 'Revoke Link'}
								</Button>
							</div>
						</div>
					) : (
						<div className='grid grid-cols-2 gap-3'>
							<Button
								variant='outline'
								onClick={onGenerate}
								disabled={isGenerating}
								data-testid='share-regenerate-link'
								className={cn(A1_ACTION, A1_SECONDARY)}
							>
								<HugeiconsIcon
									icon={Refresh04Icon}
									strokeWidth={1.8}
									aria-hidden='true'
									className={cn('size-[18px]', isGenerating && 'animate-spin motion-reduce:animate-none')}
								/>
								Regenerate
							</Button>
							<Button
								variant='destructive-soft'
								onClick={() => setConfirmingRevoke(true)}
								data-testid='share-revoke-link'
								className={A1_ACTION}
							>
								<HugeiconsIcon
									icon={Delete02Icon}
									strokeWidth={1.8}
									aria-hidden='true'
									className='size-[18px]'
								/>
								Revoke
							</Button>
						</div>
					)}
				</>
			)}
		</section>
	)
}
