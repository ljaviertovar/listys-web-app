'use client'

import * as RadixScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils'

interface Props {
	children: React.ReactNode
	className?: string
	scrollHint?: boolean
	size?: 'default' | 'sheet'
}

export function ScrollArea({ children, className, scrollHint = false, size = 'default' }: Props) {
	const viewportRef = useRef<HTMLDivElement>(null)
	const [showScrollHint, setShowScrollHint] = useState(false)
	const updateScrollHint = useCallback(() => {
		const viewport = viewportRef.current
		setShowScrollHint(!!scrollHint && !!viewport && viewport.scrollHeight > viewport.clientHeight + 1 && viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1)
	}, [scrollHint])
	useEffect(() => {
		const viewport = viewportRef.current
		if (!scrollHint || !viewport) {
			setShowScrollHint(false)
			return
		}
		const observer = new ResizeObserver(updateScrollHint)
		observer.observe(viewport)
		if (viewport.firstElementChild) observer.observe(viewport.firstElementChild)
		updateScrollHint()
		return () => observer.disconnect()
	}, [children, scrollHint, updateScrollHint])

	return (
		<RadixScrollArea.Root className={cn('relative w-full h-full', size === 'sheet' && 'h-[min(60dvh,34rem)]', className)}>
			<RadixScrollArea.Viewport ref={viewportRef} onScroll={updateScrollHint} className='h-full w-full rounded-[inherit]'>{children}</RadixScrollArea.Viewport>
			<RadixScrollArea.Scrollbar
				orientation='vertical'
				className='flex select-none touch-none p-0.5 bg-transparent transition-colors duration-160 ease-out hover:bg-border/40 w-2.5'
			>
				<RadixScrollArea.Thumb className='flex-1 rounded-full bg-border/60' />
			</RadixScrollArea.Scrollbar>
			<RadixScrollArea.Scrollbar
				orientation='horizontal'
				className='flex select-none touch-none p-0.5 bg-transparent transition-colors duration-160 ease-out hover:bg-border/40 h-2.5 border-t border-border'
			>
				<RadixScrollArea.Thumb className='flex-1 rounded-full bg-border/60' />
			</RadixScrollArea.Scrollbar>
			<RadixScrollArea.Corner />
			{showScrollHint ? <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-card via-card/75 to-transparent' /> : null}
		</RadixScrollArea.Root>
	)
}

export default ScrollArea
