import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CornerPoints } from '../types'

const WIDTH = 300
const HEIGHT = 420

const corners: CornerPoints = {
	topLeftCorner: { x: 20, y: 10 },
	topRightCorner: { x: 180, y: 10 },
	bottomLeftCorner: { x: 20, y: 290 },
	bottomRightCorner: { x: 180, y: 290 },
}

/** A grey frame: a bright rectangle (the receipt) on a dark ground. */
function receiptFrame(left: number, top: number, right: number, bottom: number) {
	const gray = new Uint8Array(WIDTH * HEIGHT).fill(40)
	for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) gray[y * WIDTH + x] = 220
	return gray
}

function createRuntime(options: { contours?: number; frame?: Uint8Array } = {}) {
	const { contours: contourCount = 1, frame = receiptFrame(60, 70, 220, 340) } = options
	// Everything OpenCV hands out has to be deleted exactly once.
	const created: Array<{ delete: ReturnType<typeof vi.fn> }> = []
	class Mat {
		data = new Uint8Array()
		data32S = new Int32Array()
		delete = vi.fn()
		constructor() { created.push(this) }
	}
	class MatVector {
		delete = vi.fn()
		constructor() { created.push(this) }
		size() { return contourCount }
		get() { return new Mat() }
	}
	const cv = {
		Mat,
		MatVector,
		Size: class { constructor(readonly width: number, readonly height: number) {} },
		Scalar: class {},
		CV_32FC2: 1,
		INTER_LINEAR: 2,
		BORDER_CONSTANT: 3,
		COLOR_RGBA2GRAY: 4,
		THRESH_BINARY: 5,
		THRESH_OTSU: 6,
		ADAPTIVE_THRESH_GAUSSIAN_C: 7,
		MORPH_RECT: 8,
		MORPH_CLOSE: 9,
		MORPH_OPEN: 10,
		RETR_EXTERNAL: 11,
		CHAIN_APPROX_SIMPLE: 12,
		RotatedRect: {
			// The blob's minimum rectangle, a little looser than the paper.
			points: vi.fn(() => [{ x: 52, y: 62 }, { x: 228, y: 62 }, { x: 228, y: 348 }, { x: 52, y: 348 }]),
		},
		imread: vi.fn(() => new Mat()),
		cvtColor: vi.fn(),
		GaussianBlur: vi.fn((_source: unknown, destination: { data: Uint8Array }) => { destination.data = frame }),
		threshold: vi.fn(),
		adaptiveThreshold: vi.fn(),
		Canny: vi.fn(),
		dilate: vi.fn(),
		getStructuringElement: vi.fn(() => new Mat()),
		morphologyEx: vi.fn(),
		findContours: vi.fn(),
		convexHull: vi.fn(),
		minAreaRect: vi.fn(() => ({ size: { width: 176, height: 286 } })),
		contourArea: vi.fn(() => 40_000),
		matFromArray: vi.fn(() => new Mat()),
		getPerspectiveTransform: vi.fn(() => new Mat()),
		warpPerspective: vi.fn(),
		imshow: vi.fn(),
	}
	const script = () => {
		const listeners = new Map<string, () => void>()
		return {
			dataset: {} as Record<string, string>,
			addEventListener: vi.fn((event: string, listener: () => void) => listeners.set(event, listener)),
			load: () => listeners.get('load')?.(),
		}
	}
	const canvas = () => ({ width: 0, height: 0, getContext: () => null })
	const scripts = [script()]
	const document = {
		querySelector: vi.fn(() => null),
		createElement: vi.fn((name: string) => name === 'canvas' ? canvas() : scripts.shift()),
		head: { append: vi.fn((element: ReturnType<typeof script>) => element.load()) },
	}
	const window = { cv }
	return { cv, created, document, window }
}

const image = () => ({ width: WIDTH, height: HEIGHT }) as HTMLCanvasElement

describe('receipt scanner image processing', () => {
	let runtime: ReturnType<typeof createRuntime>
	let scannerEngine: typeof import('../receipt-scanner-engine')

	async function load(next = createRuntime()) {
		runtime = next
		vi.stubGlobal('window', runtime.window)
		vi.stubGlobal('document', runtime.document)
		vi.resetModules()
		scannerEngine = await import('../receipt-scanner-engine')
		await scannerEngine.loadReceiptScanner()
	}

	beforeEach(() => load())

	afterEach(() => vi.unstubAllGlobals())

	it('loads only OpenCV and initializes when it returns its own thenable module', async () => {
		const freshRuntime = createRuntime()
		let subscriptions = 0
		const cv = {
			...freshRuntime.cv,
			then(onReady: (module: typeof freshRuntime.cv) => void) {
				if (++subscriptions > 1) throw new Error('OpenCV module was awaited recursively')
				queueMicrotask(() => onReady(cv))
				return cv
			},
		}
		vi.stubGlobal('window', { ...freshRuntime.window, cv })
		vi.stubGlobal('document', freshRuntime.document)
		vi.resetModules()
		const engine = await import('../receipt-scanner-engine')
		expect((await engine.loadReceiptScanner()).cv).toBe(cv)
		expect(freshRuntime.document.head.append).toHaveBeenCalledTimes(1)
	})

	it('maps preview corners to the full camera image', () => {
		expect(scannerEngine.scaleReceiptCorners(corners, 360, 640, 1080, 1920)).toEqual({
			topLeftCorner: { x: 60, y: 30 },
			topRightCorner: { x: 540, y: 30 },
			bottomLeftCorner: { x: 60, y: 870 },
			bottomRightCorner: { x: 540, y: 870 },
		})
	})

	it('finds the paper and pulls the rough blob onto its real edge', () => {
		const found = scannerEngine.detectReceiptCorners(image(), 'capture')
		expect(found).not.toBeNull()
		// The paper is 60..220 by 70..340; the blob's rectangle was 8 pixels looser, and the edge is placed within a couple of pixels.
		expect(Math.abs(found!.topLeftCorner.x - 60)).toBeLessThan(3)
		expect(Math.abs(found!.topLeftCorner.y - 70)).toBeLessThan(3)
		expect(Math.abs(found!.bottomRightCorner.x - 220)).toBeLessThan(3)
		expect(Math.abs(found!.bottomRightCorner.y - 340)).toBeLessThan(3)
	})

	it('tries fewer masks while the camera is live than for the shot', () => {
		scannerEngine.detectReceiptCorners(image(), 'live')
		const live = runtime.cv.findContours.mock.calls.length
		runtime.cv.findContours.mockClear()
		scannerEngine.detectReceiptCorners(image(), 'capture')
		expect(live).toBeGreaterThan(0)
		expect(runtime.cv.findContours.mock.calls.length).toBeGreaterThan(live * 2)
	})

	it('releases every OpenCV object after a detection, found or not', () => {
		scannerEngine.detectReceiptCorners(image(), 'capture')
		const flat = createRuntime({ frame: new Uint8Array(WIDTH * HEIGHT).fill(120) })
		return load(flat).then(() => {
			expect(scannerEngine.detectReceiptCorners(image(), 'capture')).toBeNull()
			expect(flat.created.length).toBeGreaterThan(10)
			expect(flat.created.every(item => item.delete.mock.calls.length === 1)).toBe(true)
		})
	})

	it('releases everything when OpenCV throws half-way', () => {
		runtime.cv.findContours.mockImplementation(() => { throw new Error('OpenCV failed') })
		expect(() => scannerEngine.detectReceiptCorners(image(), 'capture')).toThrow('OpenCV failed')
		expect(runtime.created.every(item => item.delete.mock.calls.length === 1)).toBe(true)
	})

	it('finds nothing when no blob looks like a rectangle', () => {
		// The convex hull fills a fifth of its minimum rectangle: a scattered shape, not paper.
		runtime.cv.minAreaRect.mockReturnValue({ size: { width: 400, height: 500 } })
		expect(scannerEngine.detectReceiptCorners(image(), 'capture')).toBeNull()
	})

	it('releases all OpenCV matrices when perspective correction fails', () => {
		const before = runtime.created.length
		runtime.cv.warpPerspective.mockImplementation(() => { throw new Error('Perspective correction failed') })
		expect(() => scannerEngine.extractReceipt(image(), corners)).toThrow('Perspective correction failed')
		const used = runtime.created.slice(before)
		expect(used.length).toBeGreaterThanOrEqual(5)
		expect(used.every(item => item.delete.mock.calls.length === 1)).toBe(true)
	})
})
