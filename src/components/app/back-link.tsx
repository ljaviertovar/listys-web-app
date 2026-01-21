import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

interface Props {
	href: string
	label: string
}

export default function BackLink({ href, label }: Props) {
	return (
		<Link
			href={href}
			className='flex items-center gap-1 text-sm text-muted-foreground hover:underline'
		>
			<HugeiconsIcon
				icon={ArrowLeft02Icon}
				strokeWidth={2}
				className='h-4 w-4'
			/>
			{label}
		</Link>
	)
}
