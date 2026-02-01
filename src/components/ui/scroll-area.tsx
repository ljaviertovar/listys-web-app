'use client'

import * as RadixScrollArea from '@radix-ui/react-scroll-area'
import { cn } from '@/utils/cn'

interface Props {
	children: React.ReactNode
	className?: string
}

export function ScrollArea({ children, className }: Props) {
	return (
		<RadixScrollArea.Root className={cn('relative w-full h-full', className)}>
			<RadixScrollArea.Viewport className='h-full w-full rounded-[inherit]'>{children}</RadixScrollArea.Viewport>
			<RadixScrollArea.Scrollbar
				orientation='vertical'
				className='flex select-none touch-none p-0.5 bg-transparent transition-colors duration-160 ease-out hover:bg-border/40 w-2.5 border-l border-border'
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
		</RadixScrollArea.Root>
	)
}

export default ScrollArea
