import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { Card } from '@/components/ui/card'
import { RowIcon } from '../row-icon'
import { EmptyState } from './empty-state'

interface EmptyStateCardProps {
    icon: IconSvgElement
    tone?: 'blue' | 'amber'
    title: string
    description: ReactNode
    children?: ReactNode
    testId: string
}

export function EmptyStateCard({ icon, tone = 'blue', title, description, children, testId }: EmptyStateCardProps) {
    return (
        <Card data-testid={testId}>
            <EmptyState
                testId={`${testId}-content`}
                media={<RowIcon icon={icon} tone={tone === 'amber' ? 'warning' : 'primary'} size='empty' testId={`${testId}-icon`} />}
                title={title}
                description={description}
            >
                {children}
            </EmptyState>
        </Card>
    )
}
