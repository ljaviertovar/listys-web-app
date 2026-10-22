import { ActionLink } from '@/components/commons'

interface Props {
	href: string
	/** What "all" refers to ("groups"); only read aloud, so each link has its own accessible name. */
	noun: string
	testId: string
}

/** The "View all" link at the right of every section title. */
export function ViewAllLink({ href, noun, testId }: Props) {
	return (
		<ActionLink
			href={href}
			testId={testId}
			className='shrink-0'
		>
			<span>
				View All<span className='sr-only'> {noun}</span>
			</span>
		</ActionLink>
	)
}
