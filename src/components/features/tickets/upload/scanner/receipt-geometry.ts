import type { CornerPoints, Point } from './types'

/**
 * Pure geometry for the receipt scanner: no OpenCV and no DOM, so every rule here can be tested with plain numbers and
 * synthetic grey images. The engine finds a rough outline; this module orders it, refines each side against the real edge
 * in the image, and keeps the live outline steady between frames.
 */

type Gray = Uint8Array | Uint8ClampedArray

export function polygonArea(points: Point[]) {
	let area = 0
	for (let index = 0; index < points.length; index++) {
		const next = points[(index + 1) % points.length]
		area += points[index].x * next.y - next.x * points[index].y
	}
	return Math.abs(area) / 2
}

/** Orders four points around their centre and starts at the top-left; null when they do not make a convex quadrilateral. */
export function orderCorners(points: Point[]): CornerPoints | null {
	if (points.length !== 4) return null
	const centre = { x: points.reduce((sum, point) => sum + point.x, 0) / 4, y: points.reduce((sum, point) => sum + point.y, 0) / 4 }
	const sorted = [...points].sort((a, b) => Math.atan2(a.y - centre.y, a.x - centre.x) - Math.atan2(b.y - centre.y, b.x - centre.x))
	const turns = sorted.map((a, index) => {
		const b = sorted[(index + 1) % 4]
		const c = sorted[(index + 2) % 4]
		return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
	})
	if (!(turns.every(turn => turn > 0) || turns.every(turn => turn < 0))) return null
	const topLeft = sorted.reduce((best, point, index) => (point.x + point.y < sorted[best].x + sorted[best].y ? index : best), 0)
	return {
		topLeftCorner: sorted[topLeft],
		topRightCorner: sorted[(topLeft + 1) % 4],
		bottomRightCorner: sorted[(topLeft + 2) % 4],
		bottomLeftCorner: sorted[(topLeft + 3) % 4],
	}
}

export function cornersToList(corners: CornerPoints): Point[] {
	return [corners.topLeftCorner, corners.topRightCorner, corners.bottomRightCorner, corners.bottomLeftCorner]
}

/** A sheet of paper seen at an angle still has corners near 90 degrees; anything far from it is not a receipt. */
export function hasPaperAngles(points: Point[], min = 60, max = 120) {
	for (let index = 0; index < 4; index++) {
		const before = points[(index + 3) % 4]
		const corner = points[index]
		const after = points[(index + 1) % 4]
		const ax = before.x - corner.x
		const ay = before.y - corner.y
		const bx = after.x - corner.x
		const by = after.y - corner.y
		const length = Math.hypot(ax, ay) * Math.hypot(bx, by)
		if (length === 0) return false
		const degrees = (Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / length))) * 180) / Math.PI
		if (degrees < min || degrees > max) return false
	}
	return true
}

export function countFrameTouches(points: Point[], width: number, height: number, margin = 3) {
	return points.filter(({ x, y }) => x <= margin || y <= margin || x >= width - 1 - margin || y >= height - 1 - margin).length
}

function sampleGray(gray: Gray, width: number, height: number, x: number, y: number) {
	if (x < 0 || y < 0 || x > width - 1 || y > height - 1) return null
	const x0 = Math.floor(x)
	const y0 = Math.floor(y)
	const x1 = Math.min(width - 1, x0 + 1)
	const y1 = Math.min(height - 1, y0 + 1)
	const fx = x - x0
	const fy = y - y0
	return (gray[y0 * width + x0] * (1 - fx) + gray[y0 * width + x1] * fx) * (1 - fy) + (gray[y1 * width + x0] * (1 - fx) + gray[y1 * width + x1] * fx) * fy
}

interface Line {
	px: number
	py: number
	dx: number
	dy: number
}

/** Total least squares: the line closest to all the points at once, however it is tilted. */
function fitLine(points: Point[]): Line {
	const count = points.length
	let mx = 0
	let my = 0
	for (const { x, y } of points) {
		mx += x
		my += y
	}
	mx /= count
	my /= count
	let sxx = 0
	let sxy = 0
	let syy = 0
	for (const { x, y } of points) {
		const a = x - mx
		const b = y - my
		sxx += a * a
		sxy += a * b
		syy += b * b
	}
	const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy)
	return { px: mx, py: my, dx: Math.cos(angle), dy: Math.sin(angle) }
}

const MAX_TILT = (7 * Math.PI) / 180

/** The paper is a rectangle seen from a little to one side: a refined side cannot tilt far from the rough one. */
function limitTilt(line: Line, points: Point[], roughAngle: number): Line {
	let delta = Math.atan2(line.dy, line.dx) - roughAngle
	while (delta > Math.PI / 2) delta -= Math.PI
	while (delta < -Math.PI / 2) delta += Math.PI
	if (Math.abs(delta) <= MAX_TILT) return line
	const angle = roughAngle + Math.sign(delta) * MAX_TILT
	const dx = Math.cos(angle)
	const dy = Math.sin(angle)
	const offsets = points.map(point => -point.x * dy + point.y * dx).sort((a, b) => a - b)
	const offset = offsets[Math.floor(offsets.length / 2)]
	return { px: -dy * offset, py: dx * offset, dx, dy }
}

const distanceToLine = (line: Line, { x, y }: Point) => Math.abs((x - line.px) * line.dy - (y - line.py) * line.dx)

function intersect(a: Line, b: Line): Point | null {
	const determinant = a.dx * b.dy - a.dy * b.dx
	if (Math.abs(determinant) < 0.2) return null
	const t = ((b.px - a.px) * b.dy - (b.py - a.py) * b.dx) / determinant
	return { x: a.px + a.dx * t, y: a.py + a.dy * t }
}

export interface RefinedQuad {
	corners: CornerPoints
	/** The share of samples that agreed on an edge, averaged over the four sides (0 to 1). */
	confidence: number
	/** How many sides found an edge of their own. */
	sides: number
}

/**
 * Moves each side of a rough quadrilateral onto the edge the image really has. For many points along a side it reads the
 * brightness across the side (averaged a few steps along it, so specks and single letters wash out), picks the outermost
 * clear step in the direction most points agree on, fits a line through those points ignoring the strays, and finally
 * intersects neighbouring lines. A side without a clear edge keeps its rough position. `band` is how far, in pixels, an
 * edge may sit from the rough side.
 */
export function refineQuad(gray: Gray, width: number, height: number, rough: CornerPoints, band: number): RefinedQuad | null {
	const quad = cornersToList(rough)
	const centre = { x: quad.reduce((sum, point) => sum + point.x, 0) / 4, y: quad.reduce((sum, point) => sum + point.y, 0) / 4 }
	const lines: Line[] = []
	const support: number[] = []

	for (let side = 0; side < 4; side++) {
		const a = quad[side]
		const b = quad[(side + 1) % 4]
		const length = Math.hypot(b.x - a.x, b.y - a.y)
		if (length < 20) return null
		const ux = (b.x - a.x) / length
		const uy = (b.y - a.y) / length
		let nx = uy
		let ny = -ux
		// The normal points away from the middle of the quadrilateral.
		if (((a.x + b.x) / 2 - centre.x) * nx + ((a.y + b.y) / 2 - centre.y) * ny < 0) {
			nx = -nx
			ny = -ny
		}
		const samples = Math.max(12, Math.min(40, Math.round(length / 12)))
		const profiles: Array<{ bx: number; by: number; values: number[] }> = []
		for (let k = 0; k < samples; k++) {
			const f = 0.1 + (0.8 * (k + 0.5)) / samples
			const bx = a.x + (b.x - a.x) * f
			const by = a.y + (b.y - a.y) * f
			const values: number[] = []
			let usable = true
			// From outside to inside.
			for (let t = band; t >= -band; t--) {
				let sum = 0
				let count = 0
				for (let along = -4; along <= 4; along += 2) {
					const value = sampleGray(gray, width, height, bx + nx * t + ux * along, by + ny * t + uy * along)
					if (value !== null) {
						sum += value
						count++
					}
				}
				if (count === 0) {
					usable = false
					break
				}
				values.push(sum / count)
			}
			if (usable) profiles.push({ bx, by, values })
		}

		// Is the paper brighter or darker than what lies outside this side? The direction most samples agree on.
		let vote = 0
		for (const { values } of profiles) {
			let top = 0
			let bottom = 0
			for (let j = 2; j < values.length - 2; j++) {
				const step = values[j + 2] - values[j - 2]
				top = Math.max(top, step)
				bottom = Math.min(bottom, step)
			}
			vote += top > -bottom ? 1 : -1
		}
		const direction = vote >= 0 ? 1 : -1

		const found: Point[] = []
		for (const { bx, by, values } of profiles) {
			const steps = values.map((_, j) => (j < 2 || j >= values.length - 2 ? 0 : Math.max(0, direction * (values[j + 2] - values[j - 2]))))
			const strongest = Math.max(...steps)
			if (strongest < 10) continue
			let j = steps.findIndex(step => step >= 0.5 * strongest)
			while (j + 1 < steps.length && steps[j + 1] >= steps[j]) j++
			const t = band - j
			found.push({ x: bx + nx * t, y: by + ny * t })
		}

		const roughAngle = Math.atan2(uy, ux)
		let line: Line | null = null
		let inliers = 0
		if (found.length >= 6) {
			let fitted = fitLine(found)
			let kept = found
			for (let pass = 0; pass < 4; pass++) {
				const distances = found.map(point => distanceToLine(fitted, point))
				const median = [...distances].sort((x, y) => x - y)[Math.floor(distances.length / 2)]
				const limit = Math.max(1.5, 2.2 * median)
				kept = found.filter((_, index) => distances[index] <= limit)
				if (kept.length < 5) break
				fitted = fitLine(kept)
			}
			if (kept.length >= 5) {
				line = limitTilt(fitted, kept, roughAngle)
				inliers = kept.length / samples
			}
		}
		// A side without a clear edge keeps the rough one.
		if (!line || inliers < 0.4) {
			line = { px: a.x, py: a.y, dx: (b.x - a.x) / length, dy: (b.y - a.y) / length }
			inliers = 0
		}
		lines.push(line)
		support.push(inliers)
	}

	const points: Point[] = []
	for (let corner = 0; corner < 4; corner++) {
		const point = intersect(lines[(corner + 3) % 4], lines[corner])
		if (!point) return null
		// A refined corner that ran far from the rough one found something else.
		if (Math.hypot(point.x - quad[corner].x, point.y - quad[corner].y) > band * 2.2) return null
		points.push(point)
	}
	const corners = orderCorners(points)
	if (!corners) return null
	return {
		corners,
		confidence: support.reduce((sum, value) => sum + value, 0) / 4,
		sides: support.filter(value => value >= 0.4).length,
	}
}

export function cornerDrift(a: CornerPoints, b: CornerPoints) {
	const first = cornersToList(a)
	const second = cornersToList(b)
	return Math.max(...first.map((point, index) => Math.hypot(point.x - second[index].x, point.y - second[index].y)))
}

/** Blends a new outline into the previous one so the live outline does not jitter; a jump to somewhere else is taken at once. */
export function smoothCorners(previous: CornerPoints | null, next: CornerPoints, jump: number, weight = 0.5): CornerPoints {
	if (!previous || cornerDrift(previous, next) > jump) return next
	const mix = (before: Point, after: Point): Point => ({ x: before.x + (after.x - before.x) * weight, y: before.y + (after.y - before.y) * weight })
	return {
		topLeftCorner: mix(previous.topLeftCorner, next.topLeftCorner),
		topRightCorner: mix(previous.topRightCorner, next.topRightCorner),
		bottomRightCorner: mix(previous.bottomRightCorner, next.bottomRightCorner),
		bottomLeftCorner: mix(previous.bottomLeftCorner, next.bottomLeftCorner),
	}
}

/** Grey levels that may separate a bright receipt from what is around it: the 35th to 85th percentile of the frame's brightness. */
export function brightnessLevels(gray: Gray): number[] {
	const histogram = new Array<number>(256).fill(0)
	let total = 0
	for (let index = 0; index < gray.length; index += 5) {
		histogram[gray[index]]++
		total++
	}
	return [0.35, 0.5, 0.62, 0.74, 0.85].map(share => {
		let seen = 0
		for (let level = 0; level < 256; level++) {
			seen += histogram[level]
			if (seen >= total * share) return level
		}
		return 255
	})
}

/**
 * How clearly the image changes across each side of a quadrilateral, in one direction per side (0 to 1). The weakest side
 * counts as much as the other three together, so an outline that cuts through the paper or floats off it scores low.
 */
export function edgeSupport(gray: Gray, width: number, height: number, corners: CornerPoints): number {
	const quad = cornersToList(corners)
	const centre = { x: quad.reduce((sum, point) => sum + point.x, 0) / 4, y: quad.reduce((sum, point) => sum + point.y, 0) / 4 }
	const sides: number[] = []
	for (let side = 0; side < 4; side++) {
		const a = quad[side]
		const b = quad[(side + 1) % 4]
		const length = Math.hypot(b.x - a.x, b.y - a.y)
		if (length < 15) return 0
		const ux = (b.x - a.x) / length
		const uy = (b.y - a.y) / length
		let nx = uy
		let ny = -ux
		if (((a.x + b.x) / 2 - centre.x) * nx + ((a.y + b.y) / 2 - centre.y) * ny < 0) {
			nx = -nx
			ny = -ny
		}
		const samples = Math.max(10, Math.min(40, Math.round(length / 8)))
		let brighter = 0
		let darker = 0
		let measured = 0
		for (let k = 0; k < samples; k++) {
			const f = 0.08 + (0.84 * (k + 0.5)) / samples
			const bx = a.x + (b.x - a.x) * f
			const by = a.y + (b.y - a.y) * f
			let inside = 0
			let outside = 0
			let insideCount = 0
			let outsideCount = 0
			for (const step of [3, 5, 7]) {
				const inner = sampleGray(gray, width, height, bx - nx * step, by - ny * step)
				const outer = sampleGray(gray, width, height, bx + nx * step, by + ny * step)
				if (inner !== null) {
					inside += inner
					insideCount++
				}
				if (outer !== null) {
					outside += outer
					outsideCount++
				}
			}
			if (!insideCount || !outsideCount) continue
			measured++
			const change = inside / insideCount - outside / outsideCount
			if (change > 9) brighter++
			else if (change < -9) darker++
		}
		sides.push(measured < samples * 0.6 ? 0 : Math.max(brighter, darker) / samples)
	}
	const weakest = Math.min(...sides)
	return 0.5 * weakest + 0.5 * (sides.reduce((sum, value) => sum + value, 0) / 4)
}

/** A rough receipt-shaped blob found in a mask: the corners of its minimum rectangle and how well it fills it. */
export interface QuadCandidate {
	points: Point[]
	/** The blob's convex area over its rectangle's area (1 for a perfect rectangle). */
	fill: number
	/** The rectangle's area over the frame's. */
	areaRatio: number
}

const MIN_SUPPORT = 0.35

function centreOf(points: Point[]) {
	return { x: points.reduce((sum, point) => sum + point.x, 0) / points.length, y: points.reduce((sum, point) => sum + point.y, 0) / points.length }
}

/**
 * Chooses the receipt among rough candidates from several masks. Near-duplicates are dropped, each remaining one is pulled onto
 * the paper's real edge (a wide pass, then a narrow one), and the candidate whose four sides show the clearest edge wins, with a
 * small preference for larger and for long, narrow shapes. Null when no candidate has a clear edge on enough of its sides.
 */
export function chooseReceiptQuad(candidates: QuadCandidate[], gray: Gray, width: number, height: number, limit = 14): CornerPoints | null {
	const frame = Math.max(width, height)
	const minSide = Math.min(width, height)
	const ranked = [...candidates].sort((a, b) => b.fill * Math.sqrt(b.areaRatio) - a.fill * Math.sqrt(a.areaRatio))
	const kept: QuadCandidate[] = []
	for (const candidate of ranked) {
		if (kept.length >= limit) break
		const centre = centreOf(candidate.points)
		const duplicate = kept.some(other => {
			const otherCentre = centreOf(other.points)
			return Math.hypot(otherCentre.x - centre.x, otherCentre.y - centre.y) < frame * 0.015 && Math.abs(other.areaRatio - candidate.areaRatio) < 0.03
		})
		if (!duplicate) kept.push(candidate)
	}

	const usable = (refined: RefinedQuad | null): refined is RefinedQuad => {
		if (!refined || refined.sides < 3) return false
		const points = cornersToList(refined.corners)
		return hasPaperAngles(points) && points.every(({ x, y }) => x >= 0 && y >= 0 && x <= width - 1 && y <= height - 1)
	}

	let best: { corners: CornerPoints; score: number; support: number } | null = null
	for (const candidate of kept) {
		const rough = orderCorners(candidate.points)
		if (!rough || !hasPaperAngles(cornersToList(rough))) continue
		let corners = rough
		const wide = refineQuad(gray, width, height, rough, Math.max(10, Math.round(minSide * 0.1)))
		if (usable(wide)) {
			const narrow = refineQuad(gray, width, height, wide.corners, Math.max(5, Math.round(minSide * 0.025)))
			corners = usable(narrow) ? narrow.corners : wide.corners
		}
		const points = cornersToList(corners)
		// A receipt that touches the frame is cut off.
		if (points.some(({ x, y }) => x < 2 || y < 2 || x > width - 3 || y > height - 3)) continue
		const support = edgeSupport(gray, width, height, corners)
		const long = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
		const wideSide = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y)
		const aspect = Math.max(long, wideSide) / Math.max(1, Math.min(long, wideSide))
		const score = support * (aspect >= 1.6 ? 1 : 0.8) * Math.pow(polygonArea(points) / (width * height), 0.25)
		if (!best || score > best.score) best = { corners, score, support }
	}
	return best && best.support >= MIN_SUPPORT ? best.corners : null
}

/** Four corners in order (top-left, top-right, bottom-right, bottom-left) that turn the same way: a quadrilateral that can be straightened. */
export function isConvexQuad(corners: CornerPoints) {
	const points = cornersToList(corners)
	const turns = points.map((a, index) => {
		const b = points[(index + 1) % 4]
		const c = points[(index + 2) % 4]
		return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
	})
	return turns.every(turn => turn > 0) || turns.every(turn => turn < 0)
}

/** A rectangle inset from the frame by a share of each side: where the corners start when none were found. */
export function insetCorners(width: number, height: number, share = 0.1): CornerPoints {
	const left = width * share
	const right = width * (1 - share)
	const top = height * share
	const bottom = height * (1 - share)
	return {
		topLeftCorner: { x: left, y: top },
		topRightCorner: { x: right, y: top },
		bottomRightCorner: { x: right, y: bottom },
		bottomLeftCorner: { x: left, y: bottom },
	}
}
