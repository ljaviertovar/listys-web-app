import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'

import { RowIcon } from '@/components/commons'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

interface Props {
    testId: string
    icon: IconSvgElement
    tone: 'primary' | 'ocr' | 'success' | 'warning' | 'store'
    title: string
    message: ReactNode
    action?: ReactNode
    /** What stands where the icon tile does: the month's grey ring, for one. */
    media?: ReactNode
}

/**
 * The empty state inside a dashboard card: one row of the native Item anatomy, like the rows around it. The tile (or `media`) at
 * the start, a heading, one line of help and at most one quiet action. It never draws a card inside the card.
 */
export function DashboardEmptyState({ testId, icon, tone, title, message, action, media }: Props) {
    return (
        <Item
            size='sm'
            data-testid={testId}
        >
            <ItemMedia>
                {media ?? (
                    <RowIcon
                        icon={icon}
                        tone={tone}
                        size='md'
                        testId={`${testId}-icon`}
                    />
                )}
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    <h3>{title}</h3>
                </ItemTitle>
                <ItemDescription>{message}</ItemDescription>
                {action ? <div className='pt-2'>{action}</div> : null}
            </ItemContent>
        </Item>
    )
}
