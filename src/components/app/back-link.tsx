'use client'

import { memo } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	label: string
	/** `screen` is the A1 header link: 44px target, slate text, no extra margin; it sits above a screen title. */
	variant?: 'inline' | 'screen'
}

function BackLinkContent({ href, label, variant = 'inline' }: Props) {
	if (variant === 'screen') {
		return (
			<Button
				asChild
				variant='quiet'
				size='xl'
				className='-ml-2 w-fit pr-3 pl-1.5'
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
		<Link
			href={href}
			data-testid='back-link'
			className='group mb-4 flex w-fit items-center text-sm text-accent-foreground transition-colors hover:text-primary md:mb-6'
		>
			<HugeiconsIcon
				icon={ArrowLeft01Icon}
				strokeWidth={2}
				className='h-4 w-4 transition-transform group-hover:-translate-x-1'
			/>
			{label}
		</Link>
	)
}

export default memo(BackLinkContent)
