import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { EmptyState, RowIcon } from '@/components/commons'

interface Props {
    testId: string
    icon: IconSvgElement
    tone: 'primary' | 'ocr' | 'success' | 'warning' | 'store'
    title: string
    message: string
    action?: ReactNode
}

export function DashboardEmptyState({ testId, icon, tone, title, message, action }: Props) {
    return (
        <EmptyState
            testId={testId}
            media={<RowIcon icon={icon} tone={tone} size='empty' testId={`${testId}-icon`} />}
            title={title}
            description={message}
        >
            {action}
        </EmptyState>
    )
}
