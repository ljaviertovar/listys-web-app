'use client'

import { useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import type { TicketItem } from '@/types'

import { MergeToBaseListDialog } from '../add-to-list/merge-to-base-list-dialog'
import { TicketCompareDialog } from './ticket-compare-dialog'
import { TicketItemsCard } from './ticket-items-card'
import { TicketSelectionBar } from './ticket-selection-bar'
import { TicketPhotoPanel, TicketPhotoRow } from '../photo/ticket-photo-entry'
import { TicketPhotoViewer } from '../photo/ticket-photo-viewer'
import { usePhotoView } from '../photo/hooks/use-photo-view'
import { useTicketImageUrls } from '../photo/hooks/use-ticket-image-urls'
import { useTicketSelection } from './hooks/use-ticket-selection'
import type { TicketStatus } from '../helpers/ticket-status'

interface Props {
	ticketId: string
	title: string
	imagePaths: string[]
	items: TicketItem[]
	status: TicketStatus
	ocrError?: string | null
	/** What follows the items (the summary and the receipt's actions), rendered on the server by the page. */
	children?: ReactNode
}

/**
 * Everything on the receipt screen that has to agree about the same state: the photo (a one-line row on a phone, a panel beside the
 * items from `lg`) and the two photo views, the items with their selection, and the bar and dialog that act on it. The compare view
 * edits the very selection the page shows, and the panel and the full-screen viewer share the photo being looked at.
 */
export function TicketReview({ ticketId, title, imagePaths, items, status, ocrError, children }: Props) {
	const router = useRouter()
	const selection = useTicketSelection(items)
	const photos = useTicketImageUrls(imagePaths)
	const view = usePhotoView(photos.urls.length)
	const mobilePhotoTriggerRef = useRef<HTMLButtonElement>(null)
	const desktopPhotoTriggerRef = useRef<HTMLButtonElement>(null)
	const [viewerOpen, setViewerOpen] = useState(false)
	const [compareOpen, setCompareOpen] = useState(false)
	const [mergeOpen, setMergeOpen] = useState(false)

	const canSelect = status === 'completed'
	const canCompare = canSelect && items.length > 0
	const hasPhotos = imagePaths.length > 0

	const openCompare = () => {
		setViewerOpen(false)
		setCompareOpen(true)
	}
	const handleCompareOpenChange = (open: boolean) => {
		setCompareOpen(open)
		if (!open) {
			window.setTimeout(() => {
				const trigger = window.matchMedia('(min-width: 64rem)').matches
					? desktopPhotoTriggerRef.current
					: mobilePhotoTriggerRef.current
				trigger?.focus()
			}, 0)
		}
	}

	const handleMergeSuccess = (baseListId: string) => {
		setMergeOpen(false)
		selection.clear()
		if (baseListId) {
			router.push(`/base-lists/${baseListId}/edit`)
		} else {
			router.refresh()
		}
	}

	return (
		<div
			data-testid='ticket-review'
			className='flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-6'
		>
			{hasPhotos ? (
				<div className='lg:hidden'>
					<TicketPhotoRow
						count={imagePaths.length}
						thumbnailUrl={photos.urls[0]}
						onOpen={() => setViewerOpen(true)}
						triggerRef={mobilePhotoTriggerRef}
					/>
				</div>
			) : null}

			<div className='min-w-0 lg:col-start-1 lg:row-start-1'>
				<TicketItemsCard
					ticketId={ticketId}
					items={items}
					status={status}
					ocrError={ocrError}
					selection={selection}
					footer={
						canSelect ? (
							<TicketSelectionBar
								count={selection.count}
								total={selection.total}
								onClear={selection.clear}
								onAdd={() => setMergeOpen(true)}
							/>
						) : null
					}
				/>
			</div>

			{/* From `lg` the photo and the summary stay in view while the long list scrolls beside them. */}
			<div className='flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:col-start-2 lg:row-start-1'>
				{hasPhotos ? (
					<div className='hidden lg:block'>
						<TicketPhotoPanel
							urls={photos.urls}
							count={imagePaths.length}
							view={view}
							error={photos.error}
							onOpenFullScreen={() => setViewerOpen(true)}
						triggerRef={desktopPhotoTriggerRef}
						/>
					</div>
				) : null}
				{children}
			</div>

			<TicketPhotoViewer
				open={viewerOpen}
				onOpenChange={setViewerOpen}
				title={title}
				urls={photos.urls}
				view={view}
				error={photos.error}
				onCompare={canCompare ? openCompare : undefined}
			/>
			{canCompare ? (
				<TicketCompareDialog
					open={compareOpen}
					onOpenChange={handleCompareOpenChange}
					title={title}
					urls={photos.urls}
					view={view}
					items={items}
					selection={selection}
					canSelect={canSelect}
					onAddToList={() => setMergeOpen(true)}
				/>
			) : null}

			<MergeToBaseListDialog
				open={mergeOpen}
				onOpenChange={setMergeOpen}
				ticketId={ticketId}
				selectedItemIds={Array.from(selection.selectedIds)}
				onSuccess={handleMergeSuccess}
			/>
		</div>
	)
}
