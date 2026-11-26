import Link from 'next/link'

import { LogoMark } from '@/components/commons/logo'
import { cn } from '@/utils'

type BrandProps = {
	/** `ink` on the paper header, `on-dark` in the footer band. */
	tone?: 'ink' | 'on-dark'
	testId?: string
}

/** The Listys mark and wordmark, linking home. */
export function Brand({ tone = 'ink', testId = 'landing-brand-link' }: BrandProps) {
	return (
		<Link
			data-testid={testId}
			href='/'
			className={cn(
				'focus-ring flex min-h-11 items-center gap-2 rounded-md font-brand text-[19px] font-semibold tracking-[-0.03em] [&_svg]:size-6 [&_svg]:shrink-0',
				tone === 'ink' ? 'text-paper-ink' : 'text-white',
			)}
		>
			<LogoMark />
			Listys
		</Link>
	)
}
