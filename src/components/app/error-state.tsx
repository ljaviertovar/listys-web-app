'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Copy01Icon, RefreshIcon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { ReceiptPaper, SystemPage } from './system-page'

interface ErrorStateProps {
	/** The opaque reference Next.js derives from the error, so a report can be matched to a server log. It carries no content. */
	digest?: string
	reset: () => void
	/** Where the second action leads: the dashboard inside the app, the landing page outside it. */
	exit: { href: string; label: string; icon?: IconSvgElement }
	/** The root boundary owns the whole viewport and shows the lockup; the app one sits inside the shell. */
	fullScreen?: boolean
	testId: string
}

/**
 * The page every error boundary shows, so a failure looks the same wherever it happens: the receipt paper stopped, with its
 * price missing. It has no prop for the error itself, so the message, the stack and the paths cannot reach the page, in
 * development either; they stay in the console and the server logs. The reference is the only thing it may show.
 */
export function ErrorState({ digest, reset, exit, fullScreen = false, testId }: ErrorStateProps) {
	const titleRef = useRef<HTMLHeadingElement>(null)

	// A screen reader announces the failure once, and the keyboard starts at the title.
	useEffect(() => {
		titleRef.current?.focus()
	}, [])

	return (
		<SystemPage
			testId={testId}
			fullScreen={fullScreen}
			paper={<ReceiptPaper variant='stopped' testId={`${testId}-paper`} />}
			title='Something went wrong'
			titleRef={titleRef}
			description={
				fullScreen ? 'This screen didn’t load. Try again, or go back to a page that works.' : 'This screen didn’t load. Try again, or go back to your dashboard.'
			}
			actions={
				<>
					<Button size='xl' onClick={reset} data-testid={`${testId}-retry`}>
						<HugeiconsIcon icon={RefreshIcon} strokeWidth={1.8} data-icon='inline-start' />
						Try Again
					</Button>
					<Button asChild size='xl' variant='outline'>
						<Link href={exit.href} data-testid={`${testId}-exit`}>
							{exit.icon ? <HugeiconsIcon icon={exit.icon} strokeWidth={1.8} data-icon='inline-start' /> : null}
							{exit.label}
						</Link>
					</Button>
				</>
			}
		>
			{digest ? <Reference digest={digest} testId={`${testId}-reference`} /> : null}
		</SystemPage>
	)
}

interface ReferenceProps {
	digest: string
	testId: string
}

function Reference({ digest, testId }: ReferenceProps) {
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		if (!copied) return
		const timer = window.setTimeout(() => setCopied(false), 2000)
		return () => window.clearTimeout(timer)
	}, [copied])

	const copy = () => {
		// The clipboard is not available in every context; a failed copy leaves the code on screen to read out.
		navigator.clipboard?.writeText(digest).then(() => setCopied(true), () => undefined)
	}

	return (
		<p data-testid={testId} className='mt-5 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] text-paper-muted uppercase dark:text-muted-foreground'>
			Reference
			<span className='font-medium tracking-[0.02em] text-paper-ink dark:text-foreground'>{digest}</span>
			<Button variant='ghost' size='quiet-touch' onClick={copy} data-testid={`${testId}-copy`}>
				<HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={1.8} data-icon='inline-start' className='size-3.5' />
				<span className='font-mono text-[11px] tracking-[0.06em] text-paper-ink uppercase underline decoration-dotted underline-offset-4 dark:text-foreground'>{copied ? 'Copied' : 'Copy'}</span>
			</Button>
		</p>
	)
}
