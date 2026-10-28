import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { Ticket } from '@/types'

import { applyPhotoViewerShortcut } from '../photo/ticket-photo-viewer'
import { TicketSummaryCard } from '../receipt/ticket-summary-card'
import type { PhotoView } from '../photo/hooks/use-photo-view'

// The upload dialog reads the App Router; its own flow is covered where it lives.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const photoView = (overrides: Partial<PhotoView> = {}): PhotoView => ({
	index: 0,
	zoom: 1,
	rotation: 0,
	count: 3,
	select: () => {},
	next: () => {},
	previous: () => {},
	setZoom: () => {},
	zoomIn: () => {},
	zoomOut: () => {},
	toggleZoom: () => {},
	rotate: () => {},
	fit: () => {},
	...overrides,
})

describe('TicketSummaryCard', () => {
	const ticket = (overrides: Partial<Ticket> = {}) => ({ id: 't1', ocr_status: 'completed', ...overrides }) as Ticket
	const render = (props: Partial<Parameters<typeof TicketSummaryCard>[0]> = {}) =>
		renderToStaticMarkup(createElement(TicketSummaryCard, { ticket: ticket(), itemsCount: 28, pricedItemsCount: 28, total: 159.24, ...props }))

	it('says how much of the receipt the total covers when some items have no price', () => {
		expect(render({ pricedItemsCount: 25 })).toContain('Based on prices found for 25 of 28 items.')
	})

	it('keeps a real zero total distinct from partial price coverage', () => {
		const allZero = render({ itemsCount: 2, pricedItemsCount: 2, total: 0 })
		const partlyPricedZero = render({ itemsCount: 2, pricedItemsCount: 1, total: 0 })

		expect(allZero).toContain('$0.00')
		expect(allZero).not.toContain('Based on prices found for')
		expect(partlyPricedZero).toContain('$0.00')
		expect(partlyPricedZero).toContain('Based on prices found for 1 of 2 items.')
		expect(partlyPricedZero).toContain('This may differ from the total printed on your receipt.')
	})

	it('shows the printed receipt total when OCR found one and hides it otherwise', () => {
		expect(render({ ticket: ticket({ total_amount: 23.5 }) })).toContain('Receipt Total')
		expect(render({ ticket: ticket({ total_amount: 23.5 }) })).toContain('$23.50')
		expect(render({ ticket: ticket({ total_amount: null }) })).not.toContain('Receipt Total')
	})
})

describe('Photo viewer keyboard commands', () => {
	it('moves between photos and applies zoom shortcuts', () => {
		const next = vi.fn()
		const previous = vi.fn()
		const zoomIn = vi.fn()
		const zoomOut = vi.fn()
		const fit = vi.fn()
		const view = photoView({ count: 3, next, previous, zoomIn, zoomOut, fit })

		expect(applyPhotoViewerShortcut('ArrowRight', view)).toBe(true)
		expect(applyPhotoViewerShortcut('ArrowLeft', view)).toBe(true)
		expect(applyPhotoViewerShortcut('+', view)).toBe(true)
		expect(applyPhotoViewerShortcut('=', view)).toBe(true)
		expect(applyPhotoViewerShortcut('-', view)).toBe(true)
		expect(applyPhotoViewerShortcut('0', view)).toBe(true)
		expect(applyPhotoViewerShortcut('Escape', view)).toBe(false)
		expect(next).toHaveBeenCalledOnce()
		expect(previous).toHaveBeenCalledOnce()
		expect(zoomIn).toHaveBeenCalledTimes(2)
		expect(zoomOut).toHaveBeenCalledOnce()
		expect(fit).toHaveBeenCalledOnce()
	})
})
