import type { ReactNode } from 'react'

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

interface EmptyStateProps {
	testId: string
	media?: ReactNode
	title: ReactNode
	description: ReactNode
	children?: ReactNode
}

/** Shared empty-state anatomy; the containing feature owns its surface and actions. */
export function EmptyState({ testId, media, title, description, children }: EmptyStateProps) {
	return (
		<Empty data-testid={testId}>
			<EmptyHeader>
				{media ? <EmptyMedia>{media}</EmptyMedia> : null}
				<EmptyTitle><h2>{title}</h2></EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{children ? <EmptyContent>{children}</EmptyContent> : null}
		</Empty>
	)
}
