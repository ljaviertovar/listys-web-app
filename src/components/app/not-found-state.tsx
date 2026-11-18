import Link from 'next/link'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { GoBackButton, ReceiptPaper, SystemPage } from './system-page'

interface NotFoundStateProps {
	/** Where the primary action leads: the dashboard inside the app, the landing page outside it. */
	exit: { href: string; label: string; icon?: IconSvgElement }
	/** The root page owns the whole viewport and shows the lockup; the app one sits inside the shell. */
	fullScreen?: boolean
	testId: string
}

/**
 * The page for an address with nothing behind it: the receipt paper whole and still, with one line that is not there. It
 * has no prop for the address that was asked for, so the page cannot echo it or tell whether a record exists.
 */
export function NotFoundState({ exit, fullScreen = false, testId }: NotFoundStateProps) {
	return (
		<SystemPage
			testId={testId}
			fullScreen={fullScreen}
			paper={<ReceiptPaper variant='missing' testId={`${testId}-paper`} />}
			title='Page not found'
			description={
				fullScreen
					? 'There is nothing at this address. Check the link, or go to the home page.'
					: 'There is nothing at this address. Go back, or open your dashboard.'
			}
			actions={
				<>
					<Button asChild size='xl'>
						<Link href={exit.href} data-testid={`${testId}-exit`}>
							{exit.icon ? <HugeiconsIcon icon={exit.icon} strokeWidth={1.8} data-icon='inline-start' /> : null}
							{exit.label}
						</Link>
					</Button>
					<GoBackButton fallbackHref={exit.href} testId={`${testId}-back`} />
				</>
			}
		/>
	)
}
