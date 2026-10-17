import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

/** "Back to Home" of the auth screens: ink on the white panel (desktop), light over the photo (phone). */
export function AuthBackLink({ tone }: { tone: 'light-surface' | 'dark-surface' }) {
	const onPhoto = tone === 'dark-surface'

	return (
		<Button
			asChild
			variant={onPhoto ? 'quiet-on-dark' : 'quiet'}
			size={onPhoto ? 'touch' : 'lg'}
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
