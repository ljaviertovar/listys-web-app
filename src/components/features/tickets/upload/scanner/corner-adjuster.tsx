'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

import { Button } from '@/components/ui/button'

import { cornersToList, isConvexQuad } from './receipt-geometry'
import type { CornerPoints, Point } from './types'

interface Props {
	/** The photo the corners belong to; they are in its pixels. */
	image: HTMLCanvasElement
	corners: CornerPoints
	onChange: (corners: CornerPoints) => void
}

const KEYS = ['topLeftCorner', 'topRightCorner', 'bottomRightCorner', 'bottomLeftCorner'] as const
const LABELS = ['Top left corner', 'Top right corner', 'Bottom right corner', 'Bottom left corner']
const LOUPE = 96

/**
 * The photo with its four corners as handles to drag, for when the detected outline is off or missing. Each handle is a 44px
 * target around a 20px dot; while one is held a magnifier shows the pixels under the finger. The arrow keys move a focused
 * handle (Shift for bigger steps). A corner cannot be dragged to where the outline would stop being a convex quadrilateral.
 */
export function CornerAdjuster({ image, corners, onChange }: Props) {
	const boxRef = useRef<HTMLDivElement>(null)
	const loupeRef = useRef<HTMLCanvasElement>(null)
	const [box, setBox] = useState({ width: 0, height: 0 })
	const [active, setActive] = useState<number | null>(null)
	const src = useMemo(() => image.toDataURL('image/jpeg', 0.85), [image])

	useEffect(() => {
		const element = boxRef.current
		if (!element) return
		const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight })
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	// Where the photo sits in the box once it is fitted inside it.
	const scale = Math.min(box.width / image.width, box.height / image.height) || 0
	const shown = { width: image.width * scale, height: image.height * scale }
	const offset = { x: (box.width - shown.width) / 2, y: (box.height - shown.height) / 2 }
	const toScreen = (point: Point) => ({ x: offset.x + point.x * scale, y: offset.y + point.y * scale })
	const list = cornersToList(corners)

	// The magnifier shows the pixels under the corner being moved.
	useEffect(() => {
		if (active === null) return
		const canvas = loupeRef.current
		const context = canvas?.getContext('2d')
		if (!canvas || !context) return
		const point = cornersToList(corners)[active]
		const span = Math.max(40, Math.min(image.width, image.height) * 0.08)
		context.fillStyle = '#000'
		context.fillRect(0, 0, LOUPE, LOUPE)
		context.drawImage(image, point.x - span / 2, point.y - span / 2, span, span, 0, 0, LOUPE, LOUPE)
	}, [active, corners, image])

	const move = (index: number, point: Point) => {
		const next = { ...corners, [KEYS[index]]: { x: Math.max(0, Math.min(image.width, point.x)), y: Math.max(0, Math.min(image.height, point.y)) } }
		if (!isConvexQuad(next)) return
		onChange(next)
	}

	const fromPointer = (event: PointerEvent<HTMLElement>): Point => {
		const rect = boxRef.current!.getBoundingClientRect()
		return { x: (event.clientX - rect.left - offset.x) / scale, y: (event.clientY - rect.top - offset.y) / scale }
	}

	const handleKey = (index: number, event: KeyboardEvent<HTMLElement>) => {
		const step = Math.max(image.width, image.height) * (event.shiftKey ? 0.02 : 0.004)
		const delta: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } }
		const change = delta[event.key]
		if (!change) return
		event.preventDefault()
		const current = list[index]
		move(index, { x: current.x + change.x, y: current.y + change.y })
	}

	const polygon = list.map(point => `${toScreen(point).x},${toScreen(point).y}`).join(' ')
	const activeScreen = active === null ? null : toScreen(list[active])

	return (
		<div
			ref={boxRef}
			data-testid='receipt-corner-adjuster'
			className='relative size-full'
		>
			{scale > 0 ? (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element -- the review shows an in-memory canvas */}
					<img
						src={src}
						alt='Receipt photo with its corners marked'
						draggable={false}
						className='pointer-events-none absolute rounded-2xl select-none'
						style={{ left: offset.x, top: offset.y, width: shown.width, height: shown.height }}
					/>
					<svg
						aria-hidden='true'
						className='pointer-events-none absolute inset-0 size-full'
					>
						<polygon
							points={polygon}
							fill='var(--scan-subtle)'
							fillOpacity='0.15'
							stroke='var(--scan-strong)'
							strokeWidth='2.5'
							strokeLinejoin='round'
						/>
					</svg>
					{list.map((point, index) => {
						const screen = toScreen(point)
						return (
							<Button
								key={KEYS[index]}
								type='button'
								variant='on-dark-ghost'
								size='icon-xl'
								aria-label={LABELS[index]}
								aria-describedby='receipt-corner-help'
								data-testid={`receipt-corner-${index}`}
								className='absolute -translate-x-1/2 -translate-y-1/2 touch-none'
								style={{ left: screen.x, top: screen.y }}
								onPointerDown={event => {
									event.currentTarget.setPointerCapture(event.pointerId)
									setActive(index)
								}}
								onPointerMove={event => {
									if (active === index) move(index, fromPointer(event))
								}}
								onPointerUp={() => setActive(null)}
								onPointerCancel={() => setActive(null)}
								onKeyDown={event => handleKey(index, event)}
							>
								<span className='size-5 rounded-full bg-white ring-2 ring-primary' />
							</Button>
						)
					})}
					<p
						id='receipt-corner-help'
						className='sr-only'
					>
						Drag a corner to the receipt’s corner, or focus it and use the arrow keys.
					</p>
					{activeScreen ? (
						<canvas
							ref={loupeRef}
							width={LOUPE}
							height={LOUPE}
							aria-hidden='true'
							className='pointer-events-none absolute z-10 rounded-full ring-2 ring-white'
							style={{
								width: LOUPE,
								height: LOUPE,
								left: Math.max(4, Math.min(box.width - LOUPE - 4, activeScreen.x - LOUPE / 2)),
								top: activeScreen.y - LOUPE - 36 < 4 ? activeScreen.y + 36 : activeScreen.y - LOUPE - 36,
							}}
						/>
					) : null}
				</>
			) : null}
		</div>
	)
}
