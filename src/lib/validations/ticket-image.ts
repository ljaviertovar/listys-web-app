export type TicketImageMime = 'image/jpeg' | 'image/png'

/** Identifies supported image bytes without trusting a filename or client-supplied MIME type. */
export function getTicketImageMime(bytes: Uint8Array): TicketImageMime | null {
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
	if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png'
	return null
}
