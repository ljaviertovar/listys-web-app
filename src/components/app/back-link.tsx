import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	label: string
}

export default function BackLink({ href, label }: Props) {
	return (
		<Link
			href={href}
			className='group mb-4 md:mb-6 flex items-center text-sm text-accent-foreground hover:text-primary transition-colors w-fit'
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
