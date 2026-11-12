'use client'

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from 'next-themes'

/** The app-wide non-blocking notification region. */
export function SonnerToaster() {
	const { resolvedTheme } = useTheme()
	const theme: ToasterProps['theme'] = resolvedTheme === 'dark' ? 'dark' : 'light'

	return (
		<section aria-label='Notifications' data-testid='app-notifications'>
			<Sonner
				position='bottom-center'
				theme={theme}
				offset={24}
				mobileOffset={{ bottom: 'calc(78px + env(safe-area-inset-bottom) + 12px)' }}
				icons={{ success: <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.8} className='size-5 text-feedback-success' aria-hidden='true' /> }}
				toastOptions={{
					unstyled: true,
					classNames: {
						toast: 'relative flex min-h-12 items-center gap-3 rounded-2xl border-0 bg-inverse px-4 py-3 text-white shadow-menu ring-1 ring-white/10',
						title: 'text-sm leading-normal font-medium text-white',
						description: 'text-xs leading-normal text-inverse-muted',
						actionButton: "relative h-8 min-h-8 shrink-0 whitespace-nowrap rounded-lg bg-transparent px-3 text-sm font-semibold text-inverse-action after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0 focus-visible:ring-2 focus-visible:ring-ring",
						cancelButton: "relative h-8 min-h-8 rounded-lg bg-white/10 px-3 text-sm font-medium text-white after:absolute after:content-[''] after:-inset-y-1.5 after:inset-x-0",
						success: 'ring-feedback-success/30',
						error: 'ring-feedback-error/30',
						warning: 'ring-feedback-warning/30',
						info: 'ring-feedback-info/30',
					},
				}}
			/>
		</section>
	)
}
