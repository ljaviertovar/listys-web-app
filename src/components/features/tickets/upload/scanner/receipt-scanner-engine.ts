import { brightnessLevels, chooseReceiptQuad, type QuadCandidate } from './receipt-geometry'
import type { CornerPoints } from './types'

interface CvMatrix {
	readonly data: Uint8Array
	readonly data32S: Int32Array
	delete(): void
}

interface CvMatVector {
	size(): number
	get(index: number): CvMatrix
	delete(): void
}

interface CvRuntime {
	Mat: new () => CvMatrix
	MatVector: new () => CvMatVector
	Size: new (width: number, height: number) => unknown
	Scalar: new () => unknown
	CV_32FC2: number
	INTER_LINEAR: number
	BORDER_CONSTANT: number
	COLOR_RGBA2GRAY: number
	THRESH_BINARY: number
	THRESH_OTSU: number
	ADAPTIVE_THRESH_GAUSSIAN_C: number
	MORPH_RECT: number
	MORPH_CLOSE: number
	MORPH_OPEN: number
	RETR_EXTERNAL: number
	CHAIN_APPROX_SIMPLE: number
	RotatedRect: { points(rect: unknown): Array<{ x: number; y: number }> }
	imread(image: HTMLCanvasElement): CvMatrix
	cvtColor(source: CvMatrix, destination: CvMatrix, code: number): void
	GaussianBlur(source: CvMatrix, destination: CvMatrix, size: unknown, sigma: number): void
	threshold(source: CvMatrix, destination: CvMatrix, level: number, maximum: number, type: number): void
	adaptiveThreshold(source: CvMatrix, destination: CvMatrix, maximum: number, method: number, type: number, block: number, offset: number): void
	Canny(source: CvMatrix, destination: CvMatrix, low: number, high: number): void
	dilate(source: CvMatrix, destination: CvMatrix, kernel: CvMatrix): void
	getStructuringElement(shape: number, size: unknown): CvMatrix
	morphologyEx(source: CvMatrix, destination: CvMatrix, operation: number, kernel: CvMatrix): void
	findContours(image: CvMatrix, contours: CvMatVector, hierarchy: CvMatrix, mode: number, method: number): void
	convexHull(contour: CvMatrix, hull: CvMatrix, clockwise: boolean, returnPoints: boolean): void
	minAreaRect(points: CvMatrix): { size: { width: number; height: number } }
	contourArea(contour: CvMatrix): number
	matFromArray(rows: number, columns: number, type: number, values: number[]): CvMatrix
	getPerspectiveTransform(source: CvMatrix, destination: CvMatrix): CvMatrix
	warpPerspective(source: CvMatrix, destination: CvMatrix, transform: CvMatrix, size: unknown, interpolation: number, border: number, color: unknown): void
	imshow(canvas: HTMLCanvasElement, image: CvMatrix): void
}

declare global {
	interface Window {
		cv?: CvRuntime | { then(onReady: (runtime: CvRuntime) => void, onError?: (error: unknown) => void): unknown }
	}
}

const ENGINE_ROOT = '/vendor/receipt-scanner'
/** The longest side, in pixels, of the frame the detector looks at: lower for the live outline, higher for the shot itself. */
export const LIVE_DETECTION_SIDE = 640
export const CAPTURE_DETECTION_SIDE = 960

let cvRuntime: CvRuntime | undefined
let cvPromise: Promise<{ cv: CvRuntime }> | undefined

async function loadEngine() {
	await loadScript(`${ENGINE_ROOT}/opencv-4.7.0.js`)

	const runtime = window.cv
	if (!runtime) throw new Error('Receipt scanner engine could not be loaded.')
	// OpenCV 4.7 passes its own thenable module to the callback, so resolving it directly loops.
	const { cv } = 'then' in runtime
		? await new Promise<{ cv: CvRuntime }>((resolve, reject) => {
			runtime.then(cv => resolve({ cv }), reject)
		})
		: { cv: runtime }
	if (!cv || typeof cv.Mat !== 'function') throw new Error('Receipt scanner engine is not ready.')
	cvRuntime = cv
	return { cv }
}

function loadScript(src: string): Promise<void> {
	const existing = document.querySelector<HTMLScriptElement>(`script[data-receipt-scanner="${src}"]`)
	if (existing?.dataset.loaded === 'true') return Promise.resolve()
	if (existing) return new Promise((resolve, reject) => {
		existing.addEventListener('load', () => resolve(), { once: true })
		existing.addEventListener('error', () => reject(new Error('Receipt scanner engine could not be loaded.')), { once: true })
	})

	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = src
		script.async = true
		script.dataset.receiptScanner = src
		script.addEventListener('load', () => {
			script.dataset.loaded = 'true'
			resolve()
		}, { once: true })
		script.addEventListener('error', () => reject(new Error('Receipt scanner engine could not be loaded.')), { once: true })
		document.head.append(script)
	})
}

export function loadReceiptScanner() {
	cvPromise ??= loadEngine()
	return cvPromise
}

export function createPreviewCanvas(source: HTMLVideoElement | HTMLCanvasElement, maxSide = CAPTURE_DETECTION_SIDE) {
	const width = 'videoWidth' in source ? source.videoWidth : source.width
	const height = 'videoHeight' in source ? source.videoHeight : source.height
	const scale = Math.min(1, maxSide / Math.max(width, height))
	const canvas = document.createElement('canvas')
	canvas.width = Math.round(width * scale)
	canvas.height = Math.round(height * scale)
	canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
	return canvas
}

export type DetectionMode = 'live' | 'capture'

/**
 * Finds the receipt in a frame. Several masks (brightness levels, local contrast, edges) each propose rectangular blobs; the
 * geometry module pulls every proposal onto the paper's real edge and keeps the one whose four sides show the clearest edge.
 * The live mode tries fewer masks so the outline keeps up with the camera; the capture mode tries them all.
 */
export function detectReceiptCorners(image: HTMLCanvasElement, mode: DetectionMode = 'capture'): CornerPoints | null {
	const { cv } = getLoadedEngine()
	const width = image.width
	const height = image.height
	const owned: Array<{ delete(): void }> = []
	const own = <T extends { delete(): void }>(item: T) => {
		owned.push(item)
		return item
	}

	try {
		const source = own(cv.imread(image))
		const grey = own(new cv.Mat())
		const blur = own(new cv.Mat())
		cv.cvtColor(source, grey, cv.COLOR_RGBA2GRAY)
		cv.GaussianBlur(grey, blur, new cv.Size(5, 5), 0)
		const candidates = collectCandidates(cv, own, blur, width, height, mode)
		return chooseReceiptQuad(candidates, Uint8Array.from(blur.data), width, height, mode === 'live' ? 6 : 14)
	} finally {
		for (const item of owned) item.delete()
	}
}

function collectCandidates(
	cv: CvRuntime,
	own: <T extends { delete(): void }>(item: T) => T,
	blur: CvMatrix,
	width: number,
	height: number,
	mode: DetectionMode,
): QuadCandidate[] {
	const longest = Math.max(width, height)
	const candidates: QuadCandidate[] = []
	const odd = (value: number) => Math.round(value) | 1
	const kernel = (size: number) => own(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(size, size)))
	const small = kernel(Math.max(5, odd(longest / 120)))
	const big = kernel(Math.max(9, odd(longest / 50)))
	const open = kernel(5)
	const thin = kernel(3)
	// The live outline only needs the closing that bridges the text; the shot gets both sizes.
	const closings = mode === 'live' ? [big] : [small, big]

	const addBlobs = (mask: CvMatrix) => {
		for (const closing of closings) {
			const closed = own(new cv.Mat())
			cv.morphologyEx(mask, closed, cv.MORPH_CLOSE, closing)
			cv.morphologyEx(closed, closed, cv.MORPH_OPEN, open)
			collectBlobs(cv, closed, width, height, candidates)
		}
	}

	// A white receipt is usually among the brightest things in view.
	const levels = brightnessLevels(blur.data)
	for (const level of mode === 'live' ? levels.slice(2) : levels) {
		const mask = own(new cv.Mat())
		cv.threshold(blur, mask, level, 255, cv.THRESH_BINARY)
		addBlobs(mask)
	}
	if (mode === 'capture') {
		const otsu = own(new cv.Mat())
		cv.threshold(blur, otsu, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
		addBlobs(otsu)
	}
	// Brighter than its own neighbourhood: a receipt on a light desk.
	const windows = mode === 'live' ? [[8, -6]] : [[8, -6], [4, -10]]
	for (const [divisor, offset] of windows) {
		const mask = own(new cv.Mat())
		cv.adaptiveThreshold(blur, mask, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, Math.max(31, odd(longest / divisor)), offset)
		addBlobs(mask)
	}
	// Edges, thickened until the outline closes.
	for (const [low, high] of mode === 'live' ? [[25, 70]] : [[10, 30], [25, 70]]) {
		const edges = own(new cv.Mat())
		cv.Canny(blur, edges, low, high)
		cv.dilate(edges, edges, thin)
		addBlobs(edges)
	}
	return candidates
}

/** Rectangular blobs of a mask: each external contour's minimum rectangle, when the blob fills most of it. */
function collectBlobs(cv: CvRuntime, mask: CvMatrix, width: number, height: number, into: QuadCandidate[]) {
	const contours = new cv.MatVector()
	const hierarchy = new cv.Mat()
	const frameArea = width * height
	try {
		cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
		for (let index = 0; index < contours.size(); index++) {
			const contour = contours.get(index)
			const hull = new cv.Mat()
			try {
				const area = cv.contourArea(contour)
				if (area < frameArea * 0.02 || area > frameArea * 0.9) continue
				cv.convexHull(contour, hull, false, true)
				const hullArea = cv.contourArea(hull)
				const rectangle = cv.minAreaRect(hull)
				const rectangleArea = rectangle.size.width * rectangle.size.height
				if (rectangleArea < frameArea * 0.02) continue
				const fill = hullArea / rectangleArea
				if (fill < 0.72) continue
				into.push({ points: cv.RotatedRect.points(rectangle), fill, areaRatio: rectangleArea / frameArea })
			} finally {
				hull.delete()
				contour.delete()
			}
		}
	} finally {
		contours.delete()
		hierarchy.delete()
	}
}

export function scaleReceiptCorners(corners: CornerPoints, sourceWidth: number, sourceHeight: number, width: number, height: number): CornerPoints {
	const scaleX = width / sourceWidth
	const scaleY = height / sourceHeight
	const scale = (point: CornerPoints['topLeftCorner']) => ({ x: point.x * scaleX, y: point.y * scaleY })
	return {
		topLeftCorner: scale(corners.topLeftCorner),
		topRightCorner: scale(corners.topRightCorner),
		bottomLeftCorner: scale(corners.bottomLeftCorner),
		bottomRightCorner: scale(corners.bottomRightCorner),
	}
}

export function extractReceipt(image: HTMLCanvasElement, corners: CornerPoints): HTMLCanvasElement {
	const { cv } = getLoadedEngine()
	const width = Math.max(distance(corners.topLeftCorner, corners.topRightCorner), distance(corners.bottomLeftCorner, corners.bottomRightCorner))
	const height = Math.max(distance(corners.topLeftCorner, corners.bottomLeftCorner), distance(corners.topRightCorner, corners.bottomRightCorner))
	const result = document.createElement('canvas')
	result.width = Math.max(1, Math.round(width))
	result.height = Math.max(1, Math.round(height))

	let source: CvMatrix | undefined
	let destination: CvMatrix | undefined
	let sourcePoints: CvMatrix | undefined
	let destinationPoints: CvMatrix | undefined
	let transform: CvMatrix | undefined
	let border: unknown
	try {
		source = cv.imread(image)
		destination = new cv.Mat()
		sourcePoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
			corners.topLeftCorner.x, corners.topLeftCorner.y,
			corners.topRightCorner.x, corners.topRightCorner.y,
			corners.bottomLeftCorner.x, corners.bottomLeftCorner.y,
			corners.bottomRightCorner.x, corners.bottomRightCorner.y,
		])
		destinationPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, result.width, 0, 0, result.height, result.width, result.height])
		transform = cv.getPerspectiveTransform(sourcePoints, destinationPoints)
		border = new cv.Scalar()
		cv.warpPerspective(source, destination, transform, new cv.Size(result.width, result.height), cv.INTER_LINEAR, cv.BORDER_CONSTANT, border)
		cv.imshow(result, destination)
		return result
	} finally {
		transform?.delete()
		destinationPoints?.delete()
		sourcePoints?.delete()
		destination?.delete()
		source?.delete()
	}
}

export function canvasToReceiptFile(canvas: HTMLCanvasElement) {
	return new Promise<File>((resolve, reject) => {
		canvas.toBlob(blob => {
			if (!blob) return reject(new Error('Receipt image could not be created.'))
			resolve(new File([blob], `receipt-scan-${Date.now()}.jpg`, { type: 'image/jpeg' }))
		}, 'image/jpeg', 0.92)
	})
}

function distance(first: CornerPoints['topLeftCorner'], second: CornerPoints['topRightCorner']) {
	return Math.hypot(first.x - second.x, first.y - second.y)
}

function getLoadedEngine() {
	if (!cvRuntime) throw new Error('Receipt scanner engine is not ready.')
	return { cv: cvRuntime }
}
