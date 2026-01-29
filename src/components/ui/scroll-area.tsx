'use client'

import { cn } from '@/utils/cn'

interface Props {
	children: React.ReactNode
	className?: string
}

export function ScrollArea({ children, className = '' }: Props) {
	return <div className={cn('overflow-auto', className)}>{children}</div>
}

export default ScrollArea
