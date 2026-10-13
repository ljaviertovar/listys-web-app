

export const MIN_ZOOM = 1
export const MAX_ZOOM = 4
export const ZOOM_STEP = 0.5

export function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

/** One button press: a half step in or out, never past the limits and never off the step grid. */
export function stepZoom(zoom: number, direction: 1 | -1): number {
	return clampZoom(Math.round((zoom + direction * ZOOM_STEP) / ZOOM_STEP) * ZOOM_STEP)
}

/** Double tap: fit goes to 200%, anything zoomed goes back to fit. */
export function toggleZoom(zoom: number): number {
	return zoom > MIN_ZOOM ? MIN_ZOOM : 2
}

/** Pinch: the zoom follows the ratio between the current and the previous distance of the two fingers. */
export function pinchZoom(zoom: number, previousDistance: number, distance: number): number {
	if (previousDistance <= 0) return zoom
	return clampZoom(zoom * (distance / previousDistance))
}

export function normalizeRotation(degrees: number): number {
	return ((degrees % 360) + 360) % 360
}

export function formatZoom(zoom: number): string {
	return `${Math.round(zoom * 100)}%`
}

export interface Size {
	width: number
	height: number
}

export interface FittedSize {
	/** The photo's own displayed size, before it is turned. */
	width: number
	height: number
	/** The space it takes once turned: the width and height swap for a quarter turn. */
	boxWidth: number
	boxHeight: number
}

/**
 * How big to draw a photo: 100% is the largest size that still fits the room it has (after any quarter turn), and the zoom
 * multiplies that, so each step looks like the same enlargement whatever the shape of the photo or the screen.
 */
export function fittedSize(natural: Size, room: Size, zoom: number, sideways: boolean): FittedSize {
	const turnedWidth = sideways ? natural.height : natural.width
	const turnedHeight = sideways ? natural.width : natural.height
	const fit = Math.min(room.width / turnedWidth, room.height / turnedHeight)
	const width = natural.width * fit * zoom
	const height = natural.height * fit * zoom
	return { width, height, boxWidth: sideways ? height : width, boxHeight: sideways ? width : height }
}
