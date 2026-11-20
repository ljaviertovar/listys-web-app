import { describe, expect, it } from 'vitest'

import {
	brightnessLevels,
	chooseReceiptQuad,
	cornerDrift,
	cornersToList,
	edgeSupport,
	hasPaperAngles,
	insetCorners,
	isConvexQuad,
	orderCorners,
	polygonArea,
	refineQuad,
	smoothCorners,
	type QuadCandidate,
} from '../receipt-geometry'
import type { CornerPoints, Point } from '../types'

const WIDTH = 300
const HEIGHT = 420

/** The corners of a rectangle turned by `degrees` about its centre, in reading order. */
function rectangle(cx: number, cy: number, w: number, h: number, degrees: number): CornerPoints {
	const turn = (degrees * Math.PI) / 180
	const at = (x: number, y: number): Point => ({ x: cx + x * Math.cos(turn) - y * Math.sin(turn), y: cy + x * Math.sin(turn) + y * Math.cos(turn) })
	return { topLeftCorner: at(-w / 2, -h / 2), topRightCorner: at(w / 2, -h / 2), bottomRightCorner: at(w / 2, h / 2), bottomLeftCorner: at(-w / 2, h / 2) }
}

/** A grey frame with a bright convex quadrilateral on a dark ground: a receipt on a table, with no texture. */
function frameWith(corners: CornerPoints, paper = 220, ground = 40) {
	const gray = new Uint8Array(WIDTH * HEIGHT).fill(ground)
	const quad = cornersToList(corners)
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			let inside = true
			for (let side = 0; side < 4; side++) {
				const a = quad[side]
				const b = quad[(side + 1) % 4]
				if ((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) < 0) inside = false
			}
			if (inside) gray[y * WIDTH + x] = paper
		}
	}
	return gray
}

const shift = (corners: CornerPoints, dx: number, dy: number): CornerPoints => ({
	topLeftCorner: { x: corners.topLeftCorner.x + dx, y: corners.topLeftCorner.y + dy },
	topRightCorner: { x: corners.topRightCorner.x - dx, y: corners.topRightCorner.y + dy },
	bottomRightCorner: { x: corners.bottomRightCorner.x - dx, y: corners.bottomRightCorner.y - dy },
	bottomLeftCorner: { x: corners.bottomLeftCorner.x + dx, y: corners.bottomLeftCorner.y - dy },
})

const worstError = (a: CornerPoints, b: CornerPoints) => cornerDrift(a, b)

describe('corner order and shape', () => {
	it('orders four points from the top-left, whatever order they come in', () => {
		const truth = rectangle(150, 200, 120, 220, 10)
		const shuffled = [truth.bottomRightCorner, truth.topLeftCorner, truth.bottomLeftCorner, truth.topRightCorner]
		expect(orderCorners(shuffled)).toEqual(truth)
	})

	it('rejects a bow-tie and the wrong number of points', () => {
		expect(orderCorners([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 5 }])).toBeNull()
		const bowTie = { topLeftCorner: { x: 0, y: 0 }, topRightCorner: { x: 10, y: 10 }, bottomRightCorner: { x: 10, y: 0 }, bottomLeftCorner: { x: 0, y: 10 } }
		expect(isConvexQuad(bowTie)).toBe(false)
	})

	it('accepts the angles of paper seen at an angle and rejects a thin sliver', () => {
		expect(hasPaperAngles(cornersToList(rectangle(150, 200, 120, 220, 25)))).toBe(true)
		const sliver = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 160, y: 10 }, { x: 60, y: 10 }]
		expect(hasPaperAngles(sliver)).toBe(false)
	})

	it('measures area and the corners of an inset frame', () => {
		expect(polygonArea(cornersToList(rectangle(0, 0, 10, 20, 33)))).toBeCloseTo(200)
		const inset = insetCorners(1000, 2000, 0.1)
		expect(inset.topLeftCorner).toEqual({ x: 100, y: 200 })
		expect(inset.bottomRightCorner).toEqual({ x: 900, y: 1800 })
		expect(isConvexQuad(inset)).toBe(true)
	})
})

describe('refining a rough outline', () => {
	const truth = rectangle(150, 210, 120, 230, 10)
	const gray = frameWith(truth)

	it('pulls corners that are a dozen pixels off onto the paper’s corners', () => {
		const refined = refineQuad(gray, WIDTH, HEIGHT, shift(truth, 12, 10), 30)
		expect(refined).not.toBeNull()
		expect(refined!.sides).toBe(4)
		expect(worstError(refined!.corners, truth)).toBeLessThan(3)
	})

	it('moves a corner that is outside the paper as well as one inside it', () => {
		const looser = shift(truth, -12, -10)
		const refined = refineQuad(gray, WIDTH, HEIGHT, looser, 30)
		expect(refined).not.toBeNull()
		expect(worstError(refined!.corners, truth)).toBeLessThan(3)
	})

	it('keeps the rough outline where the image has no edge', () => {
		const flat = new Uint8Array(WIDTH * HEIGHT).fill(120)
		const refined = refineQuad(flat, WIDTH, HEIGHT, truth, 20)
		expect(refined?.sides).toBe(0)
		expect(worstError(refined!.corners, truth)).toBeLessThan(0.5)
	})

	it('does not let a side tilt far from the rough one', () => {
		// The paper is turned 15 degrees but the rough outline says 0: a side may follow at most 7 degrees.
		const tilted = frameWith(rectangle(150, 210, 120, 230, 15))
		const refined = refineQuad(tilted, WIDTH, HEIGHT, rectangle(150, 210, 120, 230, 0), 40)
		if (refined) {
			const top = refined.corners
			const angle = (Math.atan2(top.topRightCorner.y - top.topLeftCorner.y, top.topRightCorner.x - top.topLeftCorner.x) * 180) / Math.PI
			expect(Math.abs(angle)).toBeLessThanOrEqual(7.5)
		}
	})
})

describe('edge support and choosing the receipt', () => {
	const truth = rectangle(150, 210, 120, 230, 10)
	const gray = frameWith(truth)

	it('is high on the paper’s outline and low on one floating in the dark', () => {
		expect(edgeSupport(gray, WIDTH, HEIGHT, truth)).toBeGreaterThan(0.8)
		expect(edgeSupport(gray, WIDTH, HEIGHT, rectangle(60, 60, 40, 60, 0))).toBeLessThan(0.1)
	})

	it('puts the brightness levels of a frame in rising order', () => {
		const levels = brightnessLevels(gray)
		expect(levels).toHaveLength(5)
		expect([...levels].sort((a, b) => a - b)).toEqual(levels)
	})

	const candidate = (corners: CornerPoints, fill = 0.95): QuadCandidate => ({
		points: cornersToList(corners),
		fill,
		areaRatio: polygonArea(cornersToList(corners)) / (WIDTH * HEIGHT),
	})

	it('chooses the paper among rough candidates and refines it', () => {
		const chosen = chooseReceiptQuad(
			[
				candidate(shift(truth, 8, 6)),
				// A blob that is the whole table: it touches the frame, so it is cut off.
				candidate({ topLeftCorner: { x: 0, y: 0 }, topRightCorner: { x: WIDTH, y: 0 }, bottomRightCorner: { x: WIDTH, y: HEIGHT }, bottomLeftCorner: { x: 0, y: HEIGHT } }, 1),
				// A box floating in the dark.
				candidate(rectangle(60, 60, 60, 90, 0)),
			],
			gray,
			WIDTH,
			HEIGHT,
		)
		expect(chosen).not.toBeNull()
		expect(worstError(chosen!, truth)).toBeLessThan(3)
	})

	it('answers nothing when no candidate has an edge', () => {
		const flat = new Uint8Array(WIDTH * HEIGHT).fill(120)
		expect(chooseReceiptQuad([candidate(truth)], flat, WIDTH, HEIGHT)).toBeNull()
		expect(chooseReceiptQuad([], gray, WIDTH, HEIGHT)).toBeNull()
	})
})

describe('smoothing the live outline', () => {
	const before = rectangle(150, 200, 100, 200, 0)

	it('moves part of the way towards a nearby outline', () => {
		const after = shift(before, 10, 0)
		const blended = smoothCorners(before, after, 60, 0.5)
		expect(blended.topLeftCorner.x).toBeCloseTo(before.topLeftCorner.x + 5)
	})

	it('takes a far outline at once and the first one as it is', () => {
		const far = rectangle(150, 200, 100, 200, 0)
		const moved = { ...far, topLeftCorner: { x: far.topLeftCorner.x + 200, y: far.topLeftCorner.y } }
		expect(smoothCorners(before, moved, 60)).toBe(moved)
		expect(smoothCorners(null, before, 60)).toBe(before)
	})
})
