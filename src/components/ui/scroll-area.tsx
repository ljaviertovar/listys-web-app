'use client'

import * as RadixScrollArea from '@radix-ui/react-scroll-area'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils'

interface Props {
	children: React.ReactNode
	className?: string
	/** `sheet` is a fixed-height body; `sheet-fit` takes the height of its content up to the same limit, so a short sheet does not leave a blank gap. */
	size?: 'default' | 'sheet' | 'sheet-fit'
}

export function ScrollArea({ children, className, size = 'default' }: Props) {
	const viewportRef = useRef<HTMLDivElement>(null)
	const [hasScrollableOverflow, setHasScrollableOverflow] = useState(false)
	const updateOverflow = useCallback(() => {
		const viewport = viewportRef.current
		const overflow = viewport ? viewport.scrollHeight - viewport.clientHeight : 0
		setHasScrollableOverflow(overflow > 12)
	}, [])
	useEffect(() => {
		const viewport = viewportRef.current
		if (!viewport) return
		const observer = new ResizeObserver(updateOverflow)
		observer.observe(viewport)
		if (viewport.firstElementChild) observer.observe(viewport.firstElementChild)
		updateOverflow()
		return () => observer.disconnect()
	}, [children, updateOverflow])

	return (
		<RadixScrollArea.Root className={cn('relative w-full h-full', size === 'sheet' && 'h-[min(60dvh,34rem)]', size === 'sheet-fit' && 'h-auto', className)}>
		<RadixScrollArea.Viewport ref={viewportRef} onScroll={updateOverflow} className={cn('h-full w-full rounded-[inherit]', size === 'sheet-fit' && 'max-h-[min(62dvh,34rem)]')}>{children}</RadixScrollArea.Viewport>
			{hasScrollableOverflow ? <RadixScrollArea.Scrollbar
				orientation='vertical'
				className='flex select-none touch-none p-0.5 bg-transparent transition-colors duration-160 ease-out hover:bg-border/40 w-2.5'
			>
				<RadixScrollArea.Thumb className='flex-1 rounded-full bg-border/60' />
			</RadixScrollArea.Scrollbar> : null}
		</RadixScrollArea.Root>
	)
}

export default ScrollArea
