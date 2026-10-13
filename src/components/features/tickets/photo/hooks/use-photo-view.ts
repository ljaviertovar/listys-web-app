'use client'

import { useCallback, useMemo, useState } from 'react'

import { MIN_ZOOM, clampZoom, normalizeRotation, stepZoom, toggleZoom } from '../helpers/photo-zoom'

export interface PhotoView {
	index: number
	zoom: number
	rotation: number
	count: number
	select: (index: number) => void
	next: () => void
	previous: () => void
	setZoom: (zoom: number) => void
	zoomIn: () => void
	zoomOut: () => void
	toggleZoom: () => void
	rotate: () => void
	fit: () => void
}

/**
 * Which photo of a receipt is shown and how: its zoom and turn belong to that photo, so moving to another starts it at fit again.
 * The side panel and the full-screen viewer share one, so opening the viewer continues where the panel was.
 */
export function usePhotoView(count: number): PhotoView {
	const [index, setIndex] = useState(0)
	const [zoom, setZoomState] = useState(MIN_ZOOM)
	const [rotation, setRotation] = useState(0)

	const select = useCallback(
		(target: number) => {
			if (count === 0) return
			setIndex(Math.min(count - 1, Math.max(0, target)))
			setZoomState(MIN_ZOOM)
			setRotation(0)
		},
		[count],
	)

	return useMemo(
		() => ({
			// A photo that failed to sign can leave fewer than before; never point past the end.
			index: count === 0 ? 0 : Math.min(index, count - 1),
			zoom,
			rotation,
			count,
			select,
			next: () => select(index + 1),
			previous: () => select(index - 1),
			setZoom: (next: number) => setZoomState(clampZoom(next)),
			zoomIn: () => setZoomState(current => stepZoom(current, 1)),
			zoomOut: () => setZoomState(current => stepZoom(current, -1)),
			toggleZoom: () => setZoomState(toggleZoom),
			rotate: () => setRotation(current => normalizeRotation(current + 90)),
			fit: () => {
				setZoomState(MIN_ZOOM)
				setRotation(0)
			},
		}),
		[index, zoom, rotation, count, select],
	)
}
