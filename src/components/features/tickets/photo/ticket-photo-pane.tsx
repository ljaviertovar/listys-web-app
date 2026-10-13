'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils'

import { fittedSize, pinchZoom } from './helpers/photo-zoom'

interface Props {
	url: string | undefined
	alt: string
	zoom: number
	/** Quarter turns in degrees: 0, 90, 180 or 270. */
	rotation: number
	onZoomChange: (zoom: number) => void
	onDoubleTap: () => void
	/** Why there is nothing to show, when the signed URL did not load. */
	emptyMessage?: string
	/** The mouse wheel zooms (the full-screen viewer, where nothing behind it should scroll); off in the side panel. */
	wheelZoom?: boolean
	className?: string
}

/**
 * A photo that fits its box and scrolls once zoomed. Two fingers pinch it (handled on the touch events because the browser's
 * own pinch would zoom the whole page behind a full-screen viewer), a double tap toggles fit and 200%, and the parent owns
 * the buttons.
 */
export function TicketPhotoPane({ url, alt, zoom, rotation, onZoomChange, onDoubleTap, emptyMessage, wheelZoom = false, className }: Props) {
	const scrollRef = useRef<HTMLDivElement>(null)
	const lastDistance = useRef(0)
	const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
	const sideways = rotation % 180 !== 0
	// What the zoom is relative to: the photo's own size and the room it has, so 100% is "fits" and 200% is twice that.
	const [natural, setNatural] = useState<{ url: string; width: number; height: number } | null>(null)
	const [room, setRoom] = useState<{ width: number; height: number } | null>(null)

	useEffect(() => {
		const element = scrollRef.current
		if (!element) return
		const observer = new ResizeObserver(([entry]) => setRoom({ width: entry.contentRect.width, height: entry.contentRect.height }))
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	const size =
		url && natural && natural.url === url && room
			? fittedSize({ width: natural.width, height: natural.height }, room, zoom, sideways)
			: null

	useEffect(() => {
		const element = scrollRef.current
		if (!element) return

		const distance = (touches: TouchList) =>
			Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)

		const onStart = (event: TouchEvent) => {
			lastDistance.current = event.touches.length === 2 ? distance(event.touches) : 0
		}
		const onMove = (event: TouchEvent) => {
			if (event.touches.length !== 2) return
			event.preventDefault()
			const current = distance(event.touches)
			if (lastDistance.current) onZoomChange(pinchZoom(zoom, lastDistance.current, current))
			lastDistance.current = current
		}
		const onEnd = () => {
			lastDistance.current = 0
		}

		// Zoom steps are proportional, so one notch of a wheel and a long spin both feel right.
		const onWheel = (event: WheelEvent) => {
			event.preventDefault()
			onZoomChange(zoom * (1 - event.deltaY * 0.0015))
		}
		if (wheelZoom) element.addEventListener('wheel', onWheel, { passive: false })

		element.addEventListener('touchstart', onStart, { passive: true })
		element.addEventListener('touchmove', onMove, { passive: false })
		element.addEventListener('touchend', onEnd, { passive: true })
		return () => {
			element.removeEventListener('wheel', onWheel)
			element.removeEventListener('touchstart', onStart)
			element.removeEventListener('touchmove', onMove)
			element.removeEventListener('touchend', onEnd)
		}
	}, [zoom, onZoomChange, wheelZoom])

	return (
		<div
			ref={scrollRef}
			data-testid='ticket-photo-pane'
			data-zoom={zoom}
			onDoubleClick={onDoubleTap}
			// A zoomed photo is dragged around with the mouse; touch keeps its own scrolling.
			onPointerDown={event => {
				const element = scrollRef.current
				if (!element || zoom <= 1 || event.pointerType !== 'mouse') return
				drag.current = { x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop }
				element.setPointerCapture(event.pointerId)
			}}
			onPointerMove={event => {
				const element = scrollRef.current
				if (!element || !drag.current) return
				element.scrollLeft = drag.current.left - (event.clientX - drag.current.x)
				element.scrollTop = drag.current.top - (event.clientY - drag.current.y)
			}}
			onPointerUp={() => {
				drag.current = null
			}}
			onPointerCancel={() => {
				drag.current = null
			}}
			// Size containment keeps the pane the size of its box, so a big photo scrolls inside it instead of stretching it.
			className={cn(
				'relative min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain [container-type:size]',
				zoom > 1 && 'cursor-grab active:cursor-grabbing',
				className,
			)}
		>
				{url ? (
					// Until the photo has loaded and the box is measured it simply fits; afterwards it is sized in pixels from its fit.
					size && room ? (
						<div
							className='grid place-items-center'
							style={{ width: Math.max(room.width, size.boxWidth), height: Math.max(room.height, size.boxHeight) }}
						>
							<div
								className='relative'
								style={{ width: size.boxWidth, height: size.boxHeight }}
							>
								{/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL, not an optimisable asset */}
								<img
									src={url}
									alt={alt}
									draggable={false}
									style={{
										width: size.width,
										height: size.height,
										transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
									}}
									className='absolute top-1/2 left-1/2 max-w-none select-none'
								/>
							</div>
						</div>
					) : (
						<div className='flex h-full w-full items-center justify-center'>
							{/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed storage URL, not an optimisable asset */}
							<img
								src={url}
								alt={alt}
								draggable={false}
								onLoad={event => setNatural({ url, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
								className='max-h-full max-w-full object-contain select-none'
							/>
						</div>
					)
			) : (
				<p className='flex h-full items-center justify-center px-6 text-center text-sm text-slate-400'>
					{emptyMessage ?? 'Image not available'}
				</p>
			)}
		</div>
	)
}
