'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { Alert02Icon, Loading03Icon, Upload06Icon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DialogClose } from '@/components/ui/dialog'
import { cn } from '@/utils'
import { uploadTicketSchema, type UploadTicketInput } from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

import { UploadTicketPhotos } from './upload-ticket-photos'
import { ReceiptCameraScanner } from './scanner/receipt-camera-scanner'
import { usePhotoPicker } from './hooks/use-photo-picker'
import { buildUploadFormData } from './helpers/build-upload-form-data'
import { getUploadSuccessOutcome } from './helpers/upload-success'

interface Props {
	onSuccess?: () => void
	/** Photos the form starts with, for a dialog opened by dropping files on a tile. */
	initialFiles?: File[]
	/** Sent with the photos so the receipt remembers the trip it was uploaded from. */
	shoppingSessionId?: string
	/** Tells the sheet that photos are being sent, so it can keep the person from closing it. */
	onBusyChange?: (busy: boolean) => void
}

export function UploadTicketForm({ onSuccess, initialFiles, shoppingSessionId, onBusyChange }: Props) {
	const router = useRouter()
	const photosId = useId()
	const photosDescriptionId = useId()
	const [loading, setLoading] = useState(false)
	const [scannerOpen, setScannerOpen] = useState(false)
	const [scannerMessage, setScannerMessage] = useState<string | null>(null)
	const { previews, rejections, addFiles, removePhoto, dismissRejection } = usePhotoPicker(MAX_IMAGES_PER_TICKET)
	// The scanner's Photos button opens the device picker through this input, since the field's own input may be hidden.
	const deviceInputRef = useRef<HTMLInputElement>(null)
	const handleScannerExit = useCallback((message?: string) => {
		setScannerOpen(false)
		setScannerMessage(message ?? null)
	}, [])
	const handleChoosePhotos = useCallback(() => {
		deviceInputRef.current?.click()
		setScannerOpen(false)
	}, [])

	const {
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<UploadTicketInput>({
		resolver: zodResolver(uploadTicketSchema),
		defaultValues: {
			files: [],
		},
	})

	// The form is mounted fresh each time the dialog opens, so the dropped photos are taken once.
	const initialTaken = useRef(false)
	useEffect(() => {
		if (initialTaken.current || !initialFiles || initialFiles.length === 0) return
		initialTaken.current = true
		addFiles(initialFiles)
	}, [initialFiles, addFiles])

	// The picker owns the photos; the form only needs them as `files` for validation and for the request.
	useEffect(() => {
		setValue(
			'files',
			previews.map(photo => photo.file),
			{ shouldValidate: previews.length > 0 },
		)
	}, [previews, setValue])

	useEffect(() => {
		onBusyChange?.(loading)
	}, [loading, onBusyChange])

	// One valid photo is enough: the store is read from the receipt itself, so there is nothing else to fill in.
	const canSubmit = previews.length > 0 && !loading
	// When a photo was left out the button says how many go up, so that is not a surprise.
	const uploadLabel =
		rejections.length > 0
			? `Upload ${previews.length} ${previews.length === 1 ? 'Photo' : 'Photos'}`
			: previews.length > 1
				? `Upload ${previews.length} Photos`
				: 'Upload Receipt'
	const asList = loading || rejections.length > 0
	// Before the first photo the sheet is only a way in: no counter, no Upload and no Cancel (the X closes it).
	const started = previews.length > 0 || rejections.length > 0 || loading

	const onSubmit = async (data: UploadTicketInput) => {
		setLoading(true)

		try {
			const formData = buildUploadFormData(data.files, shoppingSessionId)

			const response = await fetch('/api/upload-ticket', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error('We couldn’t upload your receipt. Check your connection and try again.')
			}

			const ticketId = result?.ticketId || result?.data?.id || result?.id || null
			const outcome = getUploadSuccessOutcome({ ticketId, fromTrip: Boolean(shoppingSessionId) })
			toast.success('Receipt uploaded', { description: outcome.toastDescription })
			onSuccess?.()
			if (outcome.openReceiptId) {
				router.push(`/tickets/${outcome.openReceiptId}`)
			}
		} catch (err) {
			console.error('Failed to upload receipt:', err)
			toast.error('Could not upload receipt', { description: 'Check your connection and try again.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			data-testid='upload-ticket-form'
			onSubmit={handleSubmit(onSubmit)}
			className='flex flex-col gap-4'
		>
			<div className='flex flex-col gap-2'>
				{loading || !started ? null : (
					<div className={cn('flex items-center', rejections.length > 0 ? 'gap-1.5' : 'justify-between')}>
						<Label htmlFor={photosId}>Photos</Label>
						<span
							aria-live='polite'
							className='font-mono text-xs font-medium text-muted-foreground tabular-nums'
						>
							{rejections.length > 0 ? `${previews.length}/${MAX_IMAGES_PER_TICKET}` : `${previews.length} / ${MAX_IMAGES_PER_TICKET}`}
						</span>
					</div>
				)}

				{scannerMessage ? (
					<Alert variant='warning'>
						<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} aria-hidden='true' />
						<AlertDescription>{scannerMessage}</AlertDescription>
					</Alert>
				) : null}
				<UploadTicketPhotos
					inputId={photosId}
					descriptionId={photosDescriptionId}
					errorId={errors.files ? `${photosId}-error` : undefined}
					previews={previews}
					rejections={rejections}
					max={MAX_IMAGES_PER_TICKET}
					uploading={loading}
					cameraBlocked={Boolean(scannerMessage) && previews.length === 0}
					onAdd={addFiles}
					onScan={() => {
						setScannerMessage(null)
						setScannerOpen(true)
					}}
					onRemove={removePhoto}
					onDismissRejection={dismissRejection}
					/>
				{scannerOpen ? (
					<ReceiptCameraScanner
						count={previews.length}
						max={MAX_IMAGES_PER_TICKET}
						lastPhotoUrl={previews.at(-1)?.url ?? null}
						onAdd={file => {
							void addFiles([file])
						}}
						onChoosePhotos={handleChoosePhotos}
						onExit={handleScannerExit}
					/>
				) : null}
				<input
					ref={deviceInputRef}
					type='file'
					accept='image/png,image/jpeg'
					multiple
					tabIndex={-1}
					aria-hidden='true'
					className='sr-only'
					onChange={event => {
						if (event.target.files && event.target.files.length > 0) addFiles(event.target.files)
						event.target.value = ''
					}}
				/>
				{errors.files && <p id={`${photosId}-error`} role='alert' className='text-sm text-destructive'>{errors.files.message}</p>}
			</div>

			{/* On phones Cancel sits above Upload; from `sm` Cancel sits left and Upload right. */}
			{started ? (
				<div className='flex flex-col-reverse gap-2 sm:flex-row-reverse sm:justify-start sm:gap-3'>
					<Button
						type='submit'
						size='lg'
						disabled={!canSubmit}
						className='w-full sm:w-auto'
					>
						{loading ? (
							<>
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={1.5}
									className='size-4.5 animate-spin motion-reduce:animate-none'
								/>
								Uploading {previews.length} {previews.length === 1 ? 'photo' : 'photos'}…
							</>
						) : (
							<>
								{rejections.length > 0 ? null : (
									<HugeiconsIcon
										icon={Upload06Icon}
										strokeWidth={1.8}
										className='size-4.5'
									/>
								)}
								{uploadLabel}
							</>
						)}
					</Button>
					{asList ? null : (
						<DialogClose asChild>
							<Button
								type='button'
								variant='outline'
								size='lg'
								disabled={loading}
								className='w-full sm:w-auto'
							>
								Cancel
							</Button>
						</DialogClose>
					)}
				</div>
			) : null}
			{rejections.length > 0 ? (
				<p className='text-center text-xs leading-[1.4] text-muted-foreground dark:text-muted-foreground'>The photos that failed are left out; the rest still upload.</p>
			) : null}
		</form>
	)
}
