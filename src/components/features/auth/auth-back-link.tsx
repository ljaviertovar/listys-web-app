import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

/** "Back to Home" of the auth screens, in the receipt's mono voice: ink on the paper panel (desktop), stamped over the photo (phone). */
export function AuthBackLink({ tone }: { tone: 'light-surface' | 'dark-surface' }) {
	const onPhoto = tone === 'dark-surface'

	return (
		<Button
			asChild
			variant={onPhoto ? 'photo-stamp' : 'paper-link'}
			size='default'
		>
			<Link
				href='/'
				data-testid='auth-back-link'
			>
				<HugeiconsIcon
					icon={ArrowLeft02Icon}
					strokeWidth={1.8}
					className='size-4.5'
				/>
				Back to Home
			</Link>
		</Button>
	)
}
