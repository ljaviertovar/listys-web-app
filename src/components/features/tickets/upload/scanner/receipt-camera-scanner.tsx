'use client'

import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, ArrowReloadHorizontalIcon, Cancel01Icon, Image01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils'

import { CornerAdjuster } from './corner-adjuster'
import { insetCorners, smoothCorners } from './receipt-geometry'
import {
	canvasToReceiptFile,
	createPreviewCanvas,
	detectReceiptCorners,
	extractReceipt,
	LIVE_DETECTION_SIDE,
	scaleReceiptCorners,
} from './receipt-scanner-engine'
import { useReceiptCamera } from './hooks/use-receipt-camera'
import type { CornerPoints } from './types'

/** Frames in a row without an outline before the live outline disappears: one missed frame does not make it flicker. */
const MAX_MISSED_FRAMES = 3
/** How long a live outline stays good enough to crop the shot with, when the shot itself finds none. */
const LIVE_OUTLINE_MAX_AGE_MS = 1500

interface Props {
	/** Photos the receipt already has, so the title and counter say which part this is. */
	count: number
	max: number
	/** The last photo kept, shown on the Done button. */
	lastPhotoUrl: string | null
	onAdd: (file: File) => void
	/** Closes the camera and opens the device's photo picker. */
	onChoosePhotos: () => void
	onExit: (message?: string) => void
}

/** `corners` are the paper's corners in the photo's pixels: the ones found, or the ones the person placed. */
type Review = { original: HTMLCanvasElement; scanned: HTMLCanvasElement | null; corners: CornerPoints | null }
type Version = 'scanned' | 'original' | 'adjust'

/**
 * The receipt scanner (canvas R2, option A), full screen in the dark surface of the receipt photo viewer: close, title and count on
 * top; the camera with the edges it finds and one hint; and a camera bar at the bottom with Photos, the shutter and Done. After a
 * photo it asks one question, with Straightened, Full Photo and Adjust (drag the four corners) to choose from, and goes back to
 * the camera for the next part.
 */
export function ReceiptCameraScanner({ count, max, lastPhotoUrl, onAdd, onChoosePhotos, onExit }: Props) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [busy, setBusy] = useState(true)
	const [detectedCorners, setDetectedCorners] = useState<CornerPoints | null>(null)
	const [review, setReview] = useState<Review | null>(null)
	const [version, setVersion] = useState<Version>('scanned')
	const [error, setError] = useState<string | null>(null)
	const [isCapturing, setIsCapturing] = useState(false)
	const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })
	// The outline the live view last drew, in video pixels, and how many frames in a row found nothing.
	const liveOutline = useRef<{ corners: CornerPoints; at: number } | null>(null)
	const missedFrames = useRef(0)

	const { stream, ready, stopCamera } = useReceiptCamera(Boolean(review), onExit)

	useEffect(() => {
		const video = videoRef.current
		if (!video || !stream || !ready || review) return

		video.srcObject = stream
		let cancelled = false
		void video.play().then(
			() => { if (!cancelled) setBusy(false) },
			() => { if (!cancelled) onExit('The camera preview could not be started. Choose photos from your device instead.') },
		)
		let analyzing = false
		const interval = window.setInterval(() => {
			if (analyzing || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
			analyzing = true
			try {
				const preview = createPreviewCanvas(video, LIVE_DETECTION_SIDE)
				const found = detectReceiptCorners(preview, 'live')
				if (found) {
					missedFrames.current = 0
					const scaled = scaleReceiptCorners(found, preview.width, preview.height, video.videoWidth, video.videoHeight)
					// Each frame nudges the outline instead of replacing it; a jump to somewhere else is taken at once.
					const outline = smoothCorners(liveOutline.current?.corners ?? null, scaled, Math.hypot(video.videoWidth, video.videoHeight) * 0.12)
					liveOutline.current = { corners: outline, at: Date.now() }
					setDetectedCorners(outline)
				} else if (++missedFrames.current > MAX_MISSED_FRAMES) {
					setDetectedCorners(null)
				}
			} catch {
				setError('The camera preview could not be scanned. Choose photos from your device instead.')
			} finally {
				analyzing = false
			}
		}, 200)

		return () => {
			cancelled = true
			window.clearInterval(interval)
			video.pause()
			video.srcObject = null
		}
	}, [onExit, ready, review, stream])

	const capture = () => {
		const video = videoRef.current
		if (!video || !ready || !stream || isCapturing || video.videoWidth === 0) return
		setIsCapturing(true)
		setError(null)
		try {
			const original = document.createElement('canvas')
			original.width = video.videoWidth
			original.height = video.videoHeight
			original.getContext('2d')?.drawImage(video, 0, 0)
			const detectionFrame = createPreviewCanvas(original)
			const found = detectReceiptCorners(detectionFrame, 'capture')
			let corners = found ? scaleReceiptCorners(found, detectionFrame.width, detectionFrame.height, original.width, original.height) : null
			// What the person saw outlined when they pressed the shutter is the next best thing to the shot's own detection.
			const live = liveOutline.current
			if (!corners && live && Date.now() - live.at < LIVE_OUTLINE_MAX_AGE_MS) corners = live.corners
			const scanned = corners ? straighten(original, corners) : null
			stopCamera()
			setVersion(scanned ? 'scanned' : 'original')
			setReview({ original, scanned, corners })
		} catch {
			setError('This photo could not be processed. Try again or choose photos from your device.')
		} finally {
			setIsCapturing(false)
		}
	}

	const backToCamera = () => {
		setReview(null)
		setError(null)
		setDetectedCorners(null)
		liveOutline.current = null
		missedFrames.current = 0
		setBusy(true)
	}

	// Moving between versions: leaving Adjust straightens the photo again with the corners as they were left.
	const chooseVersion = (next: Version) => {
		if (!review) return
		if (next === 'adjust' && !review.corners) {
			setReview({ ...review, corners: insetCorners(review.original.width, review.original.height) })
		}
		if (version === 'adjust' && next !== 'adjust' && review.corners) {
			setReview({ ...review, scanned: straighten(review.original, review.corners) ?? review.scanned })
		}
		setVersion(next)
	}

	const accept = async () => {
		if (!review) return
		let canvas = version === 'scanned' && review.scanned ? review.scanned : review.original
		if (version === 'adjust' && review.corners) {
			const adjusted = straighten(review.original, review.corners)
			if (!adjusted) {
				setError('The corners you placed could not be straightened. Move them and try again.')
				return
			}
			canvas = adjusted
		}
		try {
			onAdd(await canvasToReceiptFile(canvas))
			// The last place is taken: back to the sheet. Otherwise the camera opens again for the next part.
			if (count + 1 >= max) onExit()
			else backToCamera()
		} catch {
			setError('This photo could not be prepared. Retake it or choose photos from your device.')
		}
	}

	const nextPart = count > 0
	const title = review ? 'Check the Photo' : nextPart ? 'Scan Next Part' : 'Scan Receipt'
	const shown = review && version !== 'adjust' ? (version === 'scanned' && review.scanned ? review.scanned : review.original) : null
	const hint = !stream || !ready || busy
		? stream && !ready ? 'Preparing scanner…' : 'Opening camera…'
		: detectedCorners
			? 'Edges found. Hold steady.'
			: 'Fit the whole receipt in the frame'

	return (
		<Dialog
			open
			onOpenChange={open => {
				if (!open) onExit()
			}}
		>
			<DialogContent
				hideClose
				nested
				variant='viewer'
				data-testid='receipt-camera-scanner'
				className='top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0'
			>
				<div className='flex h-15 shrink-0 items-center gap-2 px-2 lg:h-18 lg:px-5'>
					<DialogClose asChild>
						<Button
							aria-label='Close Scanner'
							variant='on-dark'
							size='icon-xl'
						>
							<HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} className='size-5.5' />
						</Button>
					</DialogClose>
					<div className='flex min-w-0 flex-1 flex-col items-center gap-0.75'>
						<DialogTitle variant='viewer' className='max-w-full truncate'>
							{title}
						</DialogTitle>
						<span aria-live='polite' className='font-mono text-xs leading-none font-medium text-slate-400 tabular-nums'>
							{count} / {max}
						</span>
					</div>
					<span className='w-11 shrink-0' />
				</div>
				<DialogDescription className='sr-only'>
					{review
						? 'Check that the store, date and total can be read, then use the photo or retake it.'
						: 'Place the receipt on a flat surface with a darker background. The edges are outlined when they are found.'}
				</DialogDescription>

				{review ? (
					<div className='flex justify-center pb-3'>
						<div
							role='radiogroup'
							aria-label='Photo version'
							className='inline-flex rounded-full bg-white/10 p-0.75'
						>
							{(
								[
									['scanned', 'Straightened'],
									['original', 'Full Photo'],
									['adjust', 'Adjust'],
								] as const
							).map(([value, label]) => (
								<Button
									key={value}
									type='button'
									role='radio'
									aria-checked={version === value}
									disabled={value === 'scanned' && !review.scanned}
									onClick={() => chooseVersion(value)}
									variant='segment-on-dark'
									size='segment-sm'
								>
									{label}
								</Button>
							))}
						</div>
					</div>
				) : null}

				<div className='relative flex min-h-0 flex-1 items-center justify-center px-4'>
					{review && version === 'adjust' && review.corners ? (
						<CornerAdjuster
							image={review.original}
							corners={review.corners}
							onChange={corners => setReview({ ...review, corners })}
						/>
					) : shown ? (
						// eslint-disable-next-line @next/next/no-img-element -- the review shows an in-memory canvas
						<img
							src={shown.toDataURL('image/jpeg')}
							alt={version === 'scanned' && review?.scanned ? 'Straightened receipt photo' : 'Full receipt photo'}
							className='max-h-full max-w-full rounded-2xl object-contain'
						/>
					) : (
						// The camera fills the space between the bars, like a phone camera; the outline is cropped the same way.
						<div className='relative size-full overflow-hidden rounded-2xl'>
							<video
								ref={videoRef}
								muted
								playsInline
								onLoadedMetadata={event => setVideoSize({ width: event.currentTarget.videoWidth, height: event.currentTarget.videoHeight })}
								aria-label='Receipt camera preview'
								className='size-full object-cover'
							/>
							{detectedCorners && videoSize.width > 0 ? <DetectionOutline corners={detectedCorners} width={videoSize.width} height={videoSize.height} /> : null}
							<span
								aria-live='polite'
								className={cn(
									'pointer-events-none absolute top-3.5 left-1/2 inline-flex h-7.5 -translate-x-1/2 items-center gap-1.5 rounded-full px-3 font-sans text-xs leading-none font-semibold whitespace-nowrap text-white',
									detectedCorners ? 'bg-primary/90 text-primary-foreground' : 'bg-slate-900/80 text-slate-200',
								)}
							>
								{detectedCorners ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className='size-3.5' /> : null}
								{hint}
							</span>
						</div>
					)}
				</div>

				{error ? (
					<Alert variant='warning' className='mx-4 mt-3 w-auto'>
						<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} aria-hidden='true' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				{review ? (
					<>
						{version === 'adjust' ? (
							<p className='px-6 pt-3 text-center text-sm text-slate-300'>Drag each corner to a corner of the receipt.</p>
						) : review.scanned ? (
							<p className='px-6 pt-3 text-center text-sm text-slate-300'>Can you read the store, date and total?</p>
						) : (
							<Alert variant='warning' className='mx-4 mt-3 w-auto'>
								<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} aria-hidden='true' />
								<AlertDescription>
									We couldn’t find the edges, so the full photo is used. Tap Adjust to place the corners yourself, or retake it on a darker surface.
								</AlertDescription>
							</Alert>
						)}
						<div className='flex shrink-0 gap-2.5 px-4 pt-4 pb-[max(1.875rem,env(safe-area-inset-bottom))] lg:justify-center lg:pb-6'>
							<Button type='button' variant='on-dark' size='xl' className='flex-1 lg:flex-none' onClick={backToCamera}>
								<HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={1.8} className='size-4.5' />
								Retake
							</Button>
							<Button type='button' size='xl' className='flex-1 lg:flex-none' onClick={() => void accept()}>
								<HugeiconsIcon icon={Tick02Icon} strokeWidth={1.8} className='size-4.5' />
								Use Photo
							</Button>
						</div>
					</>
				) : (
					<div className='grid shrink-0 grid-cols-[1fr_auto_1fr] items-center px-5 pt-4 pb-[max(1.875rem,env(safe-area-inset-bottom))] lg:pb-6'>
						<Button
							type='button'
							onClick={onChoosePhotos}
							variant='on-dark-ghost'
							size='camera-action'
							className='justify-self-start'
						>
							<span className='flex size-12 items-center justify-center rounded-2xl bg-white/12'>
								<HugeiconsIcon icon={Image01Icon} strokeWidth={1.8} className='size-5.5' />
							</span>
							Photos
						</Button>
						<Button
							type='button'
							aria-label={isCapturing ? 'Preparing photo' : 'Take Photo'}
							disabled={!ready || !stream || busy || isCapturing}
							onClick={capture}
							variant='shutter'
							size='shutter'
						>
							<span className='size-15 rounded-full bg-white transition-transform motion-reduce:transition-none' />
						</Button>
						{nextPart ? (
							<DialogClose asChild>
								<Button
									type='button'
									variant='on-dark-ghost'
									size='camera-action'
									className='justify-self-end'
								>
									<span className='relative size-12 rounded-xl bg-slate-300 ring-2 ring-white'>
										{lastPhotoUrl ? (
											// eslint-disable-next-line @next/next/no-img-element -- a local object URL preview
											<img src={lastPhotoUrl} alt='' className='size-full rounded-xl object-cover' />
										) : null}
										<span className='absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-xs font-semibold text-primary-foreground tabular-nums'>
											{count}
										</span>
									</span>
									Done
								</Button>
							</DialogClose>
						) : (
							<span aria-hidden='true' />
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}

/** The photo straightened with the given corners, or null when OpenCV cannot do it. */
function straighten(original: HTMLCanvasElement, corners: CornerPoints) {
	try {
		return extractReceipt(original, corners)
	} catch {
		return null
	}
}

function DetectionOutline({ corners, width, height }: { corners: CornerPoints; width: number; height: number }) {
	const points = [corners.topLeftCorner, corners.topRightCorner, corners.bottomRightCorner, corners.bottomLeftCorner]
	const polygon = points.map(point => `${point.x},${point.y}`).join(' ')
	const stroke = Math.max(width, height) / 140
	return (
		<svg data-testid='receipt-detection-outline' viewBox={`0 0 ${width} ${height}`} preserveAspectRatio='xMidYMid slice' aria-hidden='true' className='pointer-events-none absolute inset-0 size-full'>
			<polygon points={polygon} fill='var(--scan-subtle)' fillOpacity='0.15' stroke='var(--scan-strong)' strokeWidth={stroke} strokeLinejoin='round' />
			{points.map((point, index) => (
				<circle key={index} cx={point.x} cy={point.y} r={stroke * 2.2} fill='white' stroke='var(--scan-strong)' strokeWidth={stroke} />
			))}
		</svg>
	)
}
