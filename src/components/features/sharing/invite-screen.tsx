import type { ReactNode } from 'react'

import Logo from '@/components/commons/logo'
import { TornPaper } from '@/components/commons/torn-paper'

import { JoinListForm } from './join-list-form'

/**
 * The invitation to a shared list. It may be the first screen of Listys someone sees, so it is all paper, header included, like
 * a small landing. It shows nothing about the list before the person joins: the link alone does not grant a look at it.
 */
export function InviteScreen({ token, account }: { token: string; account: ReactNode }) {
	return (
		<div
			data-testid='invite-screen'
			className='paper-grain min-h-svh bg-paper text-paper-text dark:bg-background dark:bg-none dark:text-muted-foreground'
		>
			<header className='mx-auto flex h-16 max-w-md items-center justify-between gap-4 px-4 text-paper-ink dark:text-foreground'>
				<Logo testId='invite-logo' />
				{account}
			</header>
			<main className='mx-auto max-w-md px-4 pt-4 pb-10'>
				<p className='flex justify-between gap-3 border-b-[1.5px] border-paper-ink pb-3 font-mono text-[11px] font-medium tracking-[0.1em] text-paper-muted uppercase dark:border-border dark:text-muted-foreground'>
					<span>Invite</span>
					<span>Shared list</span>
				</p>
				<h1 className='mt-5 font-display text-[40px] leading-[0.95] font-extrabold tracking-[-0.04em] text-balance text-paper-ink dark:text-foreground'>
					Join shared list
				</h1>
				<p className='mt-3 text-base leading-normal'>You were invited to collaborate on a shopping list.</p>
				<TornPaper
					surface='card'
					testId='invite-ticket'
					className='mt-5'
				>
					<div className='flex flex-col gap-4 text-card-foreground'>
						<p className='text-[15px] leading-normal'>Everyone sees the same trip, and each check shows up on every phone.</p>
						<JoinListForm token={token} />
					</div>
				</TornPaper>
			</main>
		</div>
	)
}
