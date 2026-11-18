import { describe, expect, it } from 'vitest'

import { getTicketImageMime } from '../ticket-image'

describe('getTicketImageMime', () => {
	it('recognizes JPEG and PNG signatures', () => {
		expect(getTicketImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg')
		expect(getTicketImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png')
	})

	it('rejects empty and unsupported content', () => {
		expect(getTicketImageMime(new Uint8Array())).toBeNull()
		expect(getTicketImageMime(new Uint8Array([0x54, 0x45, 0x58, 0x54]))).toBeNull()
	})
})
