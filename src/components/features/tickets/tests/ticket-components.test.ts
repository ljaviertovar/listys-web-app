import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { Ticket, TicketItem } from '@/types'

import { TicketCard, TicketsEmptyState, TicketsList } from '../list/tickets-list'
import { TicketItemsList } from '../receipt/ticket-items-list'
import { TicketItemsCard, TicketNoItems, TicketProcessingError } from '../receipt/ticket-items-card'
import { TicketSelectionBar } from '../receipt/ticket-selection-bar'
import { TicketPhotoControls, TicketPhotoThumbs } from '../photo/ticket-photo-tools'
import { TicketPhotoPanel, TicketPhotoRow } from '../photo/ticket-photo-entry'
import { applyPhotoViewerShortcut } from '../photo/ticket-photo-viewer'
import { TicketStatusChip } from '../ticket-status-chip'
import { TicketStatusListener } from '../receipt/ticket-status-listener'
import { TicketSummaryCard } from '../receipt/ticket-summary-card'
import { UploadAnotherTile } from '../upload/upload-another-tile'
import { UploadTicketPhotos } from '../upload/upload-ticket-photos'
import { UploadTicketProgress } from '../upload/upload-ticket-form'
import type { PhotoView } from '../photo/hooks/use-photo-view'
import type { TicketSelection } from '../receipt/hooks/use-ticket-selection'

// The upload dialog reads the App Router; its own flow is covered where it lives.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

const card = (status: string | null, itemsCount: number | null = 19) =>
	renderToStaticMarkup(
		createElement(TicketCard, {
			id: 't1',
			storeName: 'Walmart',
			status,
			itemsCount,
			uploadedLabel: 'Uploaded 19 Feb 2026 · 09:42',
		}),
	)

describe('TicketStatusChip', () => {
	it('names the status in words, never by colour alone', () => {
		for (const [status, label] of [
			['pending', 'Waiting to Read'],
			['processing', 'Reading Receipt'],
			['completed', 'Ready to Review'],
			['failed', 'Failed'],
		] as const) {
			const html = renderToStaticMarkup(createElement(TicketStatusChip, { status }))
			expect(html).toContain(`data-status="${status}"`)
			expect(html).toContain(label)
		}
	})
})

describe('TicketStatusListener', () => {
	it('announces status changes politely and atomically', () => {
		const html = renderToStaticMarkup(createElement(TicketStatusListener, { ticketId: 't1', initialStatus: 'processing' }))

		expect(html).toContain('data-testid="ticket-status-announcement"')
		expect(html).toContain('role="status"')
		expect(html).toContain('aria-live="polite"')
		expect(html).toContain('aria-atomic="true"')
		expect(html).toContain('Reading Receipt')
	})
})

describe('UploadTicketProgress', () => {
	it('announces the upload without inventing a percentage or completed photo count', () => {
		const html = renderToStaticMarkup(createElement(UploadTicketProgress, { photoCount: 2 }))

		expect(html).toContain('data-testid="upload-ticket-progress"')
		expect(html).toContain('role="progressbar"')
		expect(html).toContain('aria-label="Uploading receipt"')
		expect(html).toContain('Uploading 2 photos')
		expect(html).not.toContain('aria-valuenow')
		expect(html).not.toContain('%')
	})
})

describe('TicketCard', () => {
	it('keeps the card itself plain and links its View Details action to the receipt', () => {
		const html = card('completed')

		expect(html).toContain('href="/tickets/t1"')
		expect(html).toContain('data-testid="ticket-details-t1"')
		expect(html).toContain('data-testid="ticket-card-t1"')
		expect(html).toMatch(/<article[^>]*data-testid="ticket-card-t1"/)
		expect(html).toContain('Walmart')
		expect(html).toContain('Uploaded 19 Feb 2026 · 09:42')
		expect(html).toContain('Ready to Review')
	})

	it('shows the item count and "View Details" once the receipt is read', () => {
		const html = card('completed', 19)

		expect(html).toContain('>19</b>')
		expect(html).toContain('items')
		expect(html).toContain('View Details')
		expect(card('completed', 1)).toContain(' item')
	})

	it('says a failed receipt could not be read and still offers the details', () => {
		const html = card('failed')

		expect(html).toContain('Couldn’t read this receipt')
		expect(html).toContain('View Details')
	})

	it('shows waiting and reading as one line each, without a details link', () => {
		const pending = card('pending')
		const processing = card('processing')

		expect(pending).toContain('Your receipt is uploaded and waiting to be read.')
		expect(pending).not.toContain('href="/tickets/t1"')
		expect(pending).not.toContain('View Details')
		expect(processing).toContain('Reading your receipt…')
		expect(processing).toContain('role="progressbar"')
		expect(processing).not.toContain('aria-valuenow')
		expect(processing).not.toContain('href="/tickets/t1"')
		expect(processing).not.toContain('View Details')
	})

	it('falls back to pending for an unknown status and to a name for a receipt without one', () => {
		const html = renderToStaticMarkup(
			createElement(TicketCard, { id: 't2', storeName: null, status: null, itemsCount: null, uploadedLabel: 'Uploaded' }),
		)

		expect(html).toContain('Store not recognized')
		expect(html).toContain('data-status="pending"')
	})
})

describe('TicketsList', () => {
	const ticket = { id: 't1', storeName: 'Walmart', status: 'completed', itemsCount: 19, uploadedLabel: 'Uploaded 19 Feb 2026 · 09:42' }

	it('shows only the empty state before the first receipt', () => {
		const html = renderToStaticMarkup(createElement(TicketsList, { tickets: [] }))

		expect(html).toContain('data-testid="tickets-empty-state"')
		expect(html).not.toContain('data-testid="tickets-list"')
	})

	it('lists the receipts as cards and ends the grid with the upload tile from md', () => {
		const html = renderToStaticMarkup(createElement(TicketsList, { tickets: [ticket, { ...ticket, id: 't2', storeName: 'Costco' }] }))

		expect(html).toContain('data-testid="tickets-list"')
		expect(html).toMatch(/class="[^"]*\bgrid-cols-1\b[^"]*\bsm:grid-cols-2\b/)
		expect(html).toContain('data-testid="ticket-card-t1"')
		expect(html).toContain('data-testid="ticket-card-t2"')
		expect(html).toMatch(/<li class="hidden md:block"><button[^>]*data-testid="upload-another-tile"/)
		expect(html.indexOf('upload-another-tile')).toBeGreaterThan(html.indexOf('ticket-card-t2'))
		expect(html).not.toContain('tickets-empty-state')
	})
})

describe('TicketsEmptyState', () => {
	it('offers the one primary action and spells out the upload limits', () => {
		const html = renderToStaticMarkup(createElement(TicketsEmptyState))

		expect(html).toContain('data-testid="tickets-empty-state"')
		expect(html).toContain('No receipts yet')
		expect(html).toContain('Upload Receipt')
		expect(html).toContain('1–5 photos · PNG or JPG · 10 MB each')
	})
})

describe('TicketPhotoRow', () => {
	const row = (count: number, thumbnailUrl?: string) =>
		renderToStaticMarkup(createElement(TicketPhotoRow, { count, thumbnailUrl, onOpen: () => {} }))

	it('is one button that says how many photos there are', () => {
		const html = row(1, 'https://example.test/a.jpg')

		expect(html).toContain('<button')
		expect(html).toContain('aria-label="View receipt photo, 1 photo"')
		expect(html).toContain('Receipt Photo')
		expect(html).toContain('Tap to enlarge')
		expect(html).toContain('src="https://example.test/a.jpg"')
	})

	it('names several photos in the plural and counts them on the thumbnail', () => {
		const html = row(3)

		expect(html).toContain('aria-label="View receipt photos, 3 photos"')
		expect(html).toContain('Receipt Photos')
		expect(html).toContain('>3</span>')
	})
})

describe('TicketPhotoThumbs', () => {
	it('marks the current photo for screen readers', () => {
		const html = renderToStaticMarkup(
			createElement(TicketPhotoThumbs, { urls: ['a.jpg', 'b.jpg', 'c.jpg'], current: 1, onSelect: () => {} }),
		)

		expect(html).toContain('aria-label="Photo 2, current"')
		expect(html).toContain('aria-current="true"')
		expect(html).toContain('aria-label="Photo 1"')
	})
})

function selection(overrides: Partial<TicketSelection> = {}): TicketSelection {
	return {
		selectedIds: new Set<string>(),
		count: 0,
		total: 0,
		allSelected: false,
		partiallySelected: false,
		isSelected: () => false,
		toggle: () => {},
		toggleAll: () => {},
		clear: () => {},
		...overrides,
	}
}

describe('TicketSelectionBar', () => {
	it('renders nothing until something is ticked', () => {
		expect(renderToStaticMarkup(createElement(TicketSelectionBar, { count: 0, total: 0, onClear: () => {}, onAdd: () => {} }))).toBe('')
	})

	it('shows the count, what it adds up to and the one action', () => {
		const html = renderToStaticMarkup(
			createElement(TicketSelectionBar, { count: 3, total: 19.79, onClear: () => {}, onAdd: () => {} }),
		)

		expect(html).toContain('role="region"')
		expect(html).toContain('aria-label="Selection actions"')
		expect(html).toContain('aria-live="polite"')
		expect(html).toContain('>3</b> selected')
		expect(html).toContain('$19.79')
		expect(html).toContain('Clear Selection')
		expect(html).toContain('Add to a List')
	})
})

describe('TicketItemsList', () => {
	const items: TicketItem[] = [
		{ id: 'a', ticket_id: 't', name: 'PC MINI TORTILLA', category: 'BAKERY COMMERCIAL', price: 3, quantity: 1, unit: 'unit', created_at: null, normalized_name: null },
		{ id: 'b', ticket_id: 't', name: 'LIME', category: 'Produce', price: 3.45, quantity: 5, unit: 'unit', created_at: null, normalized_name: null },
	]

	it('groups by category with an icon-less heading, Title Case names, quantity chips and mono prices', () => {
		const html = renderToStaticMarkup(createElement(TicketItemsList, { items, selection: selection(), canSelect: true }))

		expect(html).toContain('Bakery Commercial')
		expect(html).toContain('Produce')
		expect(html).toContain('PC Mini Tortilla')
		expect(html).toContain('$3.45')
		expect(html).toContain('Select all items to add to a list')
		expect(html).not.toMatch(/[🍎🥖🥬]/u)
	})

	it('shows how many are ticked and a dash when only some are', () => {
		const html = renderToStaticMarkup(
			createElement(TicketItemsList, {
				items,
				selection: selection({ selectedIds: new Set(['a']), count: 1, partiallySelected: true, isSelected: id => id === 'a' }),
				canSelect: true,
			}),
		)

		expect(html).toContain('1 of 2 selected')
		expect(html).toContain('aria-checked="mixed"')
	})

	it('has no checkboxes while the receipt is not ready', () => {
		const html = renderToStaticMarkup(createElement(TicketItemsList, { items, selection: selection(), canSelect: false }))

		expect(html).not.toContain('role="checkbox"')
		expect(html).not.toContain('Select all items')
	})
})

describe('UploadTicketPhotos', () => {
	const noop = () => {}
	const render = (props: Partial<Parameters<typeof UploadTicketPhotos>[0]> = {}) =>
		renderToStaticMarkup(
			createElement(UploadTicketPhotos, {
				previews: [],
				rejections: [],
				inputId: 'test-upload-photos',
				descriptionId: 'test-upload-description',
				max: 5,
				uploading: false,
				onAdd: noop,
				onRemove: noop,
				onDismissRejection: noop,
				...props,
			}),
		)

	it('starts as one drop target that says what is accepted', () => {
		const html = render()

		expect(html).toContain('Choose Photos')
		expect(html).toContain('Up to 5 photos · PNG or JPG (no HEIC) · 10 MB each')
		expect(html).toContain('id="test-upload-description"')
		expect(html).toContain('aria-describedby="test-upload-description"')
	})

	it('lists the photos with a remove control each and an Add More tile while there is room', () => {
		const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
		const html = render({ previews: [{ id: 'p1', file, url: 'blob:1' }] })

		expect(html).toContain('aria-label="Remove photo 1"')
		expect(html).toContain('Add More')
		expect(html).not.toContain('Choose Photos')
	})

	it('says which file was left out and how to fix it', () => {
		const html = render({ rejections: [{ id: 'r1', name: 'IMG_2043.heic', reason: 'format' }] })

		expect(html).toContain('role="alert"')
		expect(html).toContain('IMG_2043.heic can’t be used')
		expect(html).toContain('Export it as JPG or PNG')
	})

	it('locks the photos while they upload', () => {
		const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
		const html = render({ previews: [{ id: 'p1', file, url: 'blob:1' }], uploading: true })

		expect(html).not.toContain('Remove photo')
		expect(html).not.toContain('Add More')
	})
})

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

describe('TicketNoItems', () => {
	it('says why as a warning and how to get a better read', () => {
		const html = renderToStaticMarkup(createElement(TicketNoItems))

		expect(html).toContain('data-testid="ticket-no-items"')
		expect(html).toContain('No items detected')
		expect(html).toContain('We couldn’t find items in this receipt.')
		expect(html).toContain('Upload a new receipt with a clearer photo, or read this receipt again.')
		expect(html).toContain('bg-amber-100')
		expect(html).toContain('aria-label="Tips for a clearer photo"')
		expect(html).toContain('Lay the receipt flat')
		expect(html).toContain('Fit the whole receipt in the frame.')
	})
})

describe('TicketItemsCard status feedback', () => {
	const render = (status: 'pending' | 'processing') => renderToStaticMarkup(createElement(TicketItemsCard, {
		ticketId: 't1',
		items: [],
		status,
		selection: selection(),
	}))

	it('announces waiting and reading without fabricated progress values', () => {
		const pending = render('pending')
		const processing = render('processing')

		expect(pending).toContain('role="status"')
		expect(pending).toContain('Your receipt is uploaded and waiting to be read.')
		expect(processing).toContain('role="status"')
		expect(processing).toContain('Reading your receipt…')
		expect(processing).not.toContain('aria-valuenow')
		expect(processing).not.toContain('%')
	})
})

describe('TicketProcessingError', () => {
	it('has a semantic root for the failed extraction state', () => {
		const html = renderToStaticMarkup(createElement(TicketProcessingError))

		expect(html).toContain('data-testid="ticket-processing-error"')
		expect(html).toContain('Failed to Process Receipt')
	})
})

describe('TicketSummaryCard', () => {
	const ticket = (overrides: Partial<Ticket> = {}) => ({ id: 't1', ocr_status: 'completed', ...overrides }) as Ticket
	const render = (props: Partial<Parameters<typeof TicketSummaryCard>[0]> = {}) =>
		renderToStaticMarkup(createElement(TicketSummaryCard, { ticket: ticket(), itemsCount: 28, pricedItemsCount: 28, total: 159.24, ...props }))

	it('closes a read receipt with the item count, the total and a soft-red delete', () => {
		const html = render()

		expect(html).toContain('Extracted Item Total')
		expect(html).toContain('$159.24')
		expect(html).toContain('Delete Receipt')
		expect(html).not.toContain('Upload a Clearer Photo')
		expect(html).not.toContain('Try Again')
	})

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

	it('offers a better photo, another read and then delete when nothing was detected', () => {
		const html = render({ itemsCount: 0, pricedItemsCount: 0, total: 0 })

		expect(html).not.toContain('Calculated total')
		expect(html.indexOf('Upload a New Receipt')).toBeGreaterThan(-1)
		expect(html.indexOf('Read Receipt Again')).toBeGreaterThan(html.indexOf('Upload a New Receipt'))
		expect(html.indexOf('Delete Receipt')).toBeGreaterThan(html.indexOf('Read Receipt Again'))
	})

	it('labels the retry action by its outcome for a receipt that failed', () => {
		const html = render({ ticket: ticket({ ocr_status: 'failed' }), itemsCount: 0, pricedItemsCount: 0, total: 0 })

		expect(html).toContain('Read Receipt Again')
		expect(html).not.toContain('Try Again')
		expect(html).not.toContain('Upload a New Receipt')
	})
})

describe('TicketPhotoControls', () => {
	it('names every control and shows the zoom level in mono', () => {
		const html = renderToStaticMarkup(createElement(TicketPhotoControls, { view: photoView({ zoom: 1.5 }) }))

		for (const label of ['Zoom Out', 'Zoom In', 'Rotate Photo']) expect(html).toContain(`aria-label="${label}"`)
		expect(html).toContain('>150%</span>')
		expect(html).toContain('>Fit</button>')
	})

	it('cannot zoom out at fit or in at the maximum', () => {
		const atFit = renderToStaticMarkup(createElement(TicketPhotoControls, { view: photoView({ zoom: 1 }) }))
		const atMax = renderToStaticMarkup(createElement(TicketPhotoControls, { view: photoView({ zoom: 4 }) }))

		expect(atFit).toMatch(/aria-label="Zoom Out"[^>]*disabled|disabled=""[^>]*aria-label="Zoom Out"/)
		expect(atMax).toMatch(/aria-label="Zoom In"[^>]*disabled|disabled=""[^>]*aria-label="Zoom In"/)
	})
})

describe('TicketPhotoPanel', () => {
	const panel = (count: number, urls: string[]) =>
		renderToStaticMarkup(
			createElement(TicketPhotoPanel, { urls, count, view: photoView({ count }), onOpenFullScreen: () => {} }),
		)

	it('is the side card of a wide screen with a way into the full-screen viewer', () => {
		const html = panel(1, ['a.jpg'])

		expect(html).toContain('data-testid="ticket-photo-panel"')
		expect(html).toContain('Receipt Photo')
		expect(html).toContain('Open Full Screen')
		expect(html).toContain('data-testid="ticket-photo-controls"')
		expect(html).not.toContain('data-testid="ticket-photo-thumbs"')
	})

	it('adds the strip of shots and a counter when the receipt has several photos', () => {
		const html = panel(3, ['a.jpg', 'b.jpg', 'c.jpg'])

		expect(html).toContain('Receipt Photos')
		expect(html).toContain('data-testid="ticket-photo-thumbs"')
		expect(html).toContain('1 / 3')
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

describe('UploadAnotherTile', () => {
	it('is a dashed target that invites a drop and opens the form', () => {
		const html = renderToStaticMarkup(createElement(UploadAnotherTile))

		expect(html).toContain('data-testid="upload-another-tile"')
		expect(html).toContain('Upload Another Receipt')
		expect(html).toContain('Drop photos here or choose them from your computer')
		expect(html).toContain('border-dashed')
		expect(html).not.toContain('data-testid="upload-ticket-dialog"')
	})
})
