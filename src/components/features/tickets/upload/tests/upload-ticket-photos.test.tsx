import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { UploadTicketPhotos } from '../upload-ticket-photos'

const photo = (id: string) => ({ id, url: `blob:${id}`, file: new File(['x'], `${id}.jpg`, { type: 'image/jpeg' }) })

const render = (props: Record<string, unknown> = {}) =>
	renderToStaticMarkup(
		createElement(UploadTicketPhotos, {
			inputId: 'photos',
			descriptionId: 'photos-help',
			previews: [],
			rejections: [],
			max: 5,
			uploading: false,
			onAdd: () => {},
			onScan: () => {},
			onRemove: () => {},
			onDismissRejection: () => {},
			...props,
		} as never),
	)

describe('UploadTicketPhotos', () => {
	it('starts on a phone with Scan Receipt as the one primary and Choose Photos under it', () => {
		const html = render()
		const phone = html.slice(0, html.indexOf('hidden flex-col gap-3 sm:flex'))
		expect(phone).toContain('data-testid="receipt-scan-entry"')
		expect(phone).toContain('Scan Receipt')
		expect(phone).toContain('data-variant="outline"')
		expect(phone.indexOf('Scan Receipt')).toBeLessThan(phone.indexOf('Choose Photos'))
		// Only the scan card is filled.
		expect(phone.match(/data-variant="default"/g)).toHaveLength(1)
	})

	it('leads with the drop zone on a computer, with the camera as the alternative', () => {
		const html = render()
		const desktop = html.slice(html.indexOf('hidden flex-col gap-3 sm:flex'))
		expect(desktop).toContain('Drag and drop photos here')
		expect(desktop).toContain('Scan with Camera')
		expect(desktop.indexOf('Drag and drop')).toBeLessThan(desktop.indexOf('Scan with Camera'))
		// Each layout's file input has its own id.
		expect(html.match(/id="photos"/g)).toHaveLength(1)
		expect(html).toContain('id="photos-drop"')
	})

	it('makes Choose Photos the primary and the camera a quiet retry when the camera is blocked', () => {
		const html = render({ cameraBlocked: true })
		expect(html).not.toContain('Drag and drop photos here')
		expect(html.indexOf('Choose Photos')).toBeLessThan(html.indexOf('Try the Camera Again'))
		expect(html).toMatch(/data-variant="outline"[^>]*data-testid="receipt-scan-entry"|data-testid="receipt-scan-entry"[^>]*data-variant="outline"/)
	})

	it('offers the next part of the same receipt and the device once there is a photo', () => {
		const html = render({ previews: [photo('a')] })
		expect(html).toContain('Scan Next')
		expect(html).toContain('From')
		expect(html).toContain('Long receipt? Scan it in parts, top to bottom.')
		expect(html).not.toContain('Scan Receipt')
	})

	it('drops the add tiles at the limit', () => {
		const html = render({ previews: ['a', 'b', 'c', 'd', 'e'].map(photo) })
		expect(html).not.toContain('receipt-scan-next')
		expect(html).toContain('5 photos is the most for one receipt.')
	})
})
