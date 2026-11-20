import { describe, expect, it } from 'vitest'

import { admitFiles } from '../helpers/admit-files'
import { classifyPhoto } from '../helpers/classify-photo'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

const device = (name: string, size = 2 * 1024 * 1024) => ({ name, type: 'image/jpeg', size })
// A part captured with the scanner: the file the camera scanner adds, named and typed the way canvasToReceiptFile makes it.
const scanned = (size = 1.5 * 1024 * 1024) => ({ name: `receipt-scan-${Date.now()}.jpg`, type: 'image/jpeg', size })

describe('admitFiles', () => {
	it('takes every file while there is room', () => {
		const result = admitFiles([device('a.jpg'), device('b.jpg')], 1, 5)
		expect(result.slots).toBe(4)
		expect(result.admitted).toHaveLength(2)
		expect(result.dropped).toBe(0)
	})

	it('caps mixed device and scanned photos at the limit and says how many were left out', () => {
		// Two device photos and one scanned part are already there; three more arrive, one scan and two device photos.
		const incoming = [scanned(), device('c.jpg'), device('d.jpg')]
		const result = admitFiles(incoming, 3, MAX_IMAGES_PER_TICKET)
		expect(MAX_IMAGES_PER_TICKET).toBe(5)
		expect(result.slots).toBe(2)
		expect(result.admitted).toEqual(incoming.slice(0, 2))
		expect(result.dropped).toBe(1)
	})

	it('admits nothing once the receipt is full, whatever the source', () => {
		const result = admitFiles([scanned()], 5, 5)
		expect(result.slots).toBe(0)
		expect(result.admitted).toEqual([])
		expect(result.dropped).toBe(1)
	})

	it('never reports negative room when more photos than the limit are already there', () => {
		expect(admitFiles([device('x.jpg')], 7, 5).slots).toBe(0)
	})
})

describe('scanned parts go through the same format and size rules', () => {
	it('accepts a scanned JPEG part and refuses one over the size limit', () => {
		expect(classifyPhoto(scanned())).toBe('ok')
		expect(classifyPhoto(scanned(11 * 1024 * 1024))).toBe('size')
	})
})
