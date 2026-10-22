import { describe, expect, it } from 'vitest'

import type { TicketItem } from '@/types'

import { classifyPhoto, isHeic, rejectionMessage } from '../upload/helpers/classify-photo'
import { groupTicketItems, lineTotal, sumLineTotals } from '../receipt/helpers/group-ticket-items'
import {
	MAX_ZOOM,
	MIN_ZOOM,
	clampZoom,
	fittedSize,
	formatZoom,
	normalizeRotation,
	pinchZoom,
	stepZoom,
	toggleZoom,
} from '../photo/helpers/photo-zoom'
import { toTicketStatus } from '../helpers/ticket-status'

function item(overrides: Partial<TicketItem>): TicketItem {
	return {
		id: 'i1',
		ticket_id: 't1',
		name: 'Milk',
		category: 'Dairy',
		price: 1,
		quantity: 1,
		unit: 'unit',
		created_at: null,
		normalized_name: null,
		...overrides,
	}
}

describe('groupTicketItems', () => {
	it('groups by normalised category, sorted by name, with the uncategorised ones under Other', () => {
		const groups = groupTicketItems([
			item({ id: 'a', category: '27 PRODUCE' }),
			item({ id: 'b', category: 'dairy' }),
			item({ id: 'c', category: null }),
			item({ id: 'd', category: 'Produce' }),
		])

		expect(groups.map(g => g.key)).toEqual(['Dairy', 'Other', 'Produce'])
		expect(groups.find(g => g.key === 'Produce')?.items.map(i => i.id)).toEqual(['a', 'd'])
	})
})

describe('line totals', () => {
	it('multiplies price by quantity and counts a missing quantity as one and a missing price as nothing', () => {
		expect(lineTotal(item({ price: 2.5, quantity: 3 }))).toBe(7.5)
		expect(lineTotal(item({ price: 4, quantity: null }))).toBe(4)
		expect(lineTotal(item({ price: null, quantity: 5 }))).toBe(0)
		expect(sumLineTotals([item({ price: 3 }), item({ price: 7.79 }), item({ price: 9 })])).toBeCloseTo(19.79)
	})
})

describe('classifyPhoto', () => {
	const file = (name: string, type: string, size = 1000) => ({ name, type, size })

	it('rejects HEIC and HEIF by type or by extension', () => {
		expect(isHeic(file('IMG_2043.heic', ''))).toBe(true)
		expect(isHeic(file('photo.jpg', 'image/heif'))).toBe(true)
		expect(classifyPhoto(file('IMG_2043.HEIC', 'image/heic'))).toBe('format')
	})

	it('rejects a photo over the size limit and accepts a normal one', () => {
		expect(classifyPhoto(file('big.jpg', 'image/jpeg', 11 * 1024 * 1024))).toBe('size')
		expect(classifyPhoto(file('ok.jpg', 'image/jpeg', 2 * 1024 * 1024))).toBe('ok')
	})

	it('only accepts JPEG or PNG files, allowing a missing MIME type when the extension is supported', () => {
		expect(classifyPhoto(file('photo.png', 'image/png'))).toBe('ok')
		expect(classifyPhoto(file('photo.jpg', ''))).toBe('ok')
		expect(classifyPhoto(file('notes.txt', 'text/plain'))).toBe('format')
		expect(classifyPhoto(file('photo.jpg', 'text/plain'))).toBe('format')
		expect(classifyPhoto(file('photo.txt', 'image/jpeg'))).toBe('format')
	})

	it('says which file failed and how to fix it', () => {
		const heic = rejectionMessage('IMG_2043.heic', 'format')
		expect(heic.title).toContain('IMG_2043.heic')
		expect(heic.hint).toContain('JPG or PNG')
		expect(rejectionMessage('notes.txt', 'format').hint).toContain('Choose a JPG or PNG image')
		expect(rejectionMessage('big.jpg', 'size').hint).toContain('10 MB')
	})
})

describe('photo zoom', () => {
	it('moves in half steps and stays inside the limits', () => {
		expect(stepZoom(1, 1)).toBe(1.5)
		expect(stepZoom(1, -1)).toBe(MIN_ZOOM)
		expect(stepZoom(MAX_ZOOM, 1)).toBe(MAX_ZOOM)
		expect(clampZoom(9)).toBe(MAX_ZOOM)
		expect(clampZoom(0.2)).toBe(MIN_ZOOM)
	})

	it('toggles between fit and 200% on a double tap', () => {
		expect(toggleZoom(1)).toBe(2)
		expect(toggleZoom(2)).toBe(1)
		expect(toggleZoom(3.5)).toBe(1)
	})

	it('follows the distance between two fingers when pinching', () => {
		expect(pinchZoom(1, 100, 200)).toBe(2)
		expect(pinchZoom(2, 200, 100)).toBe(1)
		expect(pinchZoom(2, 0, 100)).toBe(2)
		expect(pinchZoom(3, 100, 300)).toBe(MAX_ZOOM)
	})

	it('wraps rotation to a quarter turn and writes the zoom as a percentage', () => {
		expect(normalizeRotation(450)).toBe(90)
		expect(normalizeRotation(-90)).toBe(270)
		expect(formatZoom(1.5)).toBe('150%')
	})
})

describe('fittedSize', () => {
	const room = { width: 400, height: 800 }

	it('fits a photo into its room at 100% and multiplies that by the zoom', () => {
		// 600x1100 is taller than the room's shape, so the width is what limits it: 400 wide.
		const fit = fittedSize({ width: 600, height: 1100 }, room, 1, false)
		expect(fit.width).toBeCloseTo(400)
		expect(fit.height).toBeCloseTo(733.33, 1)

		const zoomed = fittedSize({ width: 600, height: 1100 }, room, 2, false)
		expect(zoomed.width).toBeCloseTo(800)
		expect(zoomed.height).toBeCloseTo(1466.67, 1)
	})

	it('fits a wide photo by its width and a tall one by its height', () => {
		expect(fittedSize({ width: 1000, height: 500 }, room, 1, false).width).toBeCloseTo(400)
		expect(fittedSize({ width: 200, height: 1600 }, room, 1, false).height).toBeCloseTo(800)
	})

	it('swaps the box for a quarter turn and fits the turned photo', () => {
		const turned = fittedSize({ width: 600, height: 1100 }, room, 1, true)

		expect(turned.boxWidth).toBeCloseTo(turned.height)
		expect(turned.boxHeight).toBeCloseTo(turned.width)
		expect(turned.boxWidth).toBeLessThanOrEqual(400.001)
		expect(turned.boxHeight).toBeLessThanOrEqual(800.001)
	})
})

describe('toTicketStatus', () => {
	it('reads anything that is not a known status as pending', () => {
		expect(toTicketStatus('completed')).toBe('completed')
		expect(toTicketStatus('failed')).toBe('failed')
		expect(toTicketStatus(null)).toBe('pending')
		expect(toTicketStatus('weird')).toBe('pending')
	})
})
