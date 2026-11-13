'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ListViewIcon } from '@hugeicons/core-free-icons'

import { SheetDialog } from '@/components/commons'
import { TicketPhotoRow } from '@/components/features/tickets/photo/ticket-photo-entry'
import { TicketPhotoViewer } from '@/components/features/tickets/photo/ticket-photo-viewer'
import { usePhotoView } from '@/components/features/tickets/photo/hooks/use-photo-view'
import { useTicketImageUrls } from '@/components/features/tickets/photo/hooks/use-ticket-image-urls'
import { TicketStoreCard } from '@/components/features/tickets/receipt/ticket-store-card'
import { TicketUnreadableState } from '@/components/features/tickets/receipt/ticket-unreadable-state'
import { TicketStatusChip } from '@/components/features/tickets/ticket-status-chip'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatItemName, formatShortDate, formatTime } from '@/utils'

import { useTripReceiptDetails } from './hooks/use-trip-receipt-details'

interface TripReceiptDetailsSheetProps {
	ticketId: string
	open: boolean
	onOpenChange: (open: boolean) => void
	failed?: boolean
	returnHref?: string
	shoppingSessionId?: string
	testId?: string
}

export function TripReceiptDetailsSheet({
	ticketId,
	open,
	onOpenChange,
	failed = false,
	returnHref,
	shoppingSessionId,
	testId = 'trip-receipt-details-sheet',
}: TripReceiptDetailsSheetProps) {
	const { details, loading, error } = useTripReceiptDetails(ticketId, open)
	const [photoOpen, setPhotoOpen] = useState(false)
	const imagePaths = details?.image_paths?.length ? details.image_paths : details?.image_path ? [details.image_path] : []
	const photos = useTicketImageUrls(imagePaths)
	const view = usePhotoView(photos.urls.length)
	const storeName = details?.store_name?.trim() || (failed ? 'Store not recognized' : 'Store not confirmed')
	const uploadedAt = details?.created_at ? new Date(details.created_at) : null
	const validUploadedAt = uploadedAt && !Number.isNaN(uploadedAt.getTime()) ? uploadedAt : null
	const unreadable = failed && Boolean(details)
	const noItems = details?.ocr_status === 'completed' && details.items.length === 0
	const hasStoreDetails = Boolean(details?.store || details?.store_suggestion || details?.store_name?.trim())
	const photoCount = imagePaths.length
	const description = failed && validUploadedAt
		? `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} · Uploaded ${formatTime(validUploadedAt)}`
		: details && !failed
			? `${details.total_items ?? details.items.length} ${details.items.length === 1 ? 'item' : 'items'}${details.total_amount != null ? ` · ${formatCurrency(details.total_amount)}` : ''}`
		: undefined
	const title = failed
		? `Receipt${validUploadedAt ? ` · ${formatShortDate(validUploadedAt)}` : ''}`
		: storeName

	return (
		<>
			<SheetDialog
				open={open}
				onOpenChange={onOpenChange}
				title={failed ? <span className='flex w-full min-w-0 items-center justify-between gap-3'><span className='min-w-0 truncate'>{title}</span><TicketStatusChip status='failed' /></span> : title}
				description={description}
				testId={testId}
			>
				<div
					className='flex flex-col gap-4 px-1 py-1'
					data-testid={`${testId}-content`}
				>
					{loading ? (
						<p
							role='status'
							className='text-sm text-muted-foreground'
						>
							Loading receipt…
						</p>
					) : null}
					{error ? (
						<p
							role='alert'
							className='text-sm text-destructive'
						>
							{error}
						</p>
					) : null}
					{details && !loading ? (
						<>
							{imagePaths.length ? (
								<TicketPhotoRow
									count={imagePaths.length}
									thumbnailUrl={photos.urls[0]}
									onOpen={() => setPhotoOpen(true)}
								/>
							) : null}
							{unreadable ? <>
								{noItems && hasStoreDetails && details ? <TicketStoreCard
									ticketId={ticketId}
									store={details.store ?? null}
									storeSuggestion={details.store_suggestion ?? null}
									storeName={details.store_name}
									itemsFound={!noItems}
								/> : null}
								<TicketUnreadableState
								ticketId={ticketId}
								kind={noItems ? 'no-items' : 'failed'}
								testId={`${testId}-unreadable`}
								returnHref={returnHref}
								shoppingSessionId={shoppingSessionId}
								storeRecognized={hasStoreDetails}
								onRetrySuccess={() => onOpenChange(false)}
								onDeleted={() => onOpenChange(false)}
								/>
							</> : <><Card
								size='tight'
								data-testid={`${testId}-items`}
							>
								<div className='flex items-center gap-3 px-0.5'>
									<span
										aria-hidden='true'
										className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
									>
										<HugeiconsIcon
											icon={ListViewIcon}
											strokeWidth={1.5}
											className='size-5'
										/>
									</span>
									<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
										<h2 className='font-display text-base leading-normal font-semibold'>Receipt items</h2>
										<span className='text-xs leading-[1.3] text-muted-foreground dark:text-muted-foreground'>
											<b className='font-mono font-semibold text-foreground tabular-nums'>{details.items.length}</b>{' '}
											{details.items.length === 1 ? 'item' : 'items'} found
										</span>
									</div>
								</div>
								{details.items.length ? (
									<ul className='mt-2 divide-y divide-slate-200/70 overflow-hidden rounded-2xl bg-muted dark:divide-border dark:bg-muted/50'>
										{details.items.map(item => (
											<li
												key={item.id}
												data-testid={`${testId}-item-${item.id}`}
												className='flex min-h-14 items-center gap-2 py-1.5 pr-3.5 pl-3.5'
											>
												<span className='inline-flex h-5.5 shrink-0 items-center gap-1 rounded-md bg-secondary px-2 text-xs leading-none font-medium text-body dark:bg-muted dark:text-muted-foreground'>
													<b className='font-mono font-semibold text-foreground tabular-nums'>{item.quantity ?? 1}</b>
													{item.unit || 'unit'}
												</span>
												<span className='min-w-0 flex-1 truncate text-sm leading-[1.25] font-semibold'>
													{formatItemName(item.name)}
												</span>
												<span
													className={
														item.price != null
															? 'shrink-0 text-right font-mono text-sm font-semibold tabular-nums'
															: 'shrink-0 text-right text-xs text-muted-foreground'
													}
												>
													{item.price != null ? formatCurrency(item.price) : 'No price yet'}
												</span>
											</li>
										))}
									</ul>
								) : (
									<p className='px-1 text-sm text-muted-foreground'>No receipt items were read.</p>
								)}
							</Card>
							{details.total_amount != null ? (
								<Card
									size='tight'
									data-testid={`${testId}-total`}
								>
									<div className='flex items-center justify-between gap-3'>
										<span className='text-sm text-muted-foreground'>Receipt total</span>
										<strong className='font-mono text-lg tabular-nums'>{formatCurrency(details.total_amount)}</strong>
									</div>
								</Card>
							) : null}</>}
						</>
					) : null}
				</div>
			</SheetDialog>
			<TicketPhotoViewer
				open={photoOpen}
				onOpenChange={setPhotoOpen}
				nested
				title={storeName}
				urls={photos.urls}
				view={view}
				error={photos.error}
			/>
		</>
	)
}
