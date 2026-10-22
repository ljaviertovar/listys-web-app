'use client'

import { memo } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	label: string
	/** `screen` is the A1 header link: a `primary` size (40px on phones, 44px from md), slate text, no extra margin; it sits above a screen title. */
	variant?: 'inline' | 'screen'
}

function BackLinkContent({ href, label, variant = 'inline' }: Props) {
	if (variant === 'screen') {
		return (
			<Button
				asChild
				variant='quiet'
				size='primary'
				className='-ml-2 w-fit'
			>
				<Link
					href={href}
					data-testid='back-link'
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						strokeWidth={1.8}
						className='h-4 w-4'
					/>
					{label}
				</Link>
			</Button>
		)
	}

		return (
			<Button asChild variant='quiet' size='link-action' className='group mb-4 -ml-3 w-fit md:mb-6'>
			<Link href={href} data-testid='back-link'>
				<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className='size-4 transition-transform group-hover:-translate-x-1' />
				{label}
			</Link>
		</Button>
	)
}

export default memo(BackLinkContent)
