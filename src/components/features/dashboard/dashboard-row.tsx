import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

interface Props {
	href: string
	title: string
	meta?: string
	/** Receipt and session metadata (merchant, dates) is source data, so it is set in mono (Design System: Typography, Mono). */
	monoMeta?: boolean
	leading?: ReactNode
	trailing?: ReactNode
	testId: string
	className?: string
	density?: 'default' | 'compact'
	variant?: ComponentProps<typeof Item>['variant']
	size?: ComponentProps<typeof Item>['size']
}

/** One linked line inside a dashboard section card: optional icon, a title with metadata, and a trailing value or status. */
export function DashboardRow({ href, title, meta, monoMeta = false, leading, trailing, testId, className, density = 'default', variant, size }: Props) {
	return (
        <Item asChild size={size ?? (density === 'compact' ? 'xs' : 'sm')} variant={variant} className={className}>
            <Link href={href} data-testid={testId}>
                {leading ? <ItemMedia>{leading}</ItemMedia> : null}
                <ItemContent>
                    <ItemTitle title={title}>{title}</ItemTitle>
                    {meta ? <ItemDescription>{monoMeta ? <span className='font-mono tabular-nums'>{meta}</span> : meta}</ItemDescription> : null}
                </ItemContent>
                {trailing ? <ItemActions>{trailing}</ItemActions> : null}
            </Link>
        </Item>
    )
}
