'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { InformationCircleIcon, Loading03Icon, Upload06Icon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DialogClose } from '@/components/ui/dialog'
import { cn } from '@/utils'
import { uploadTicketSchema, type UploadTicketInput } from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

import { UploadTicketPhotos } from './upload-ticket-photos'
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
	const { previews, rejections, addFiles, removePhoto, dismissRejection } = usePhotoPicker(MAX_IMAGES_PER_TICKET)

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
	const uploadLabel = rejections.length > 0 ? `Upload ${previews.length} ${previews.length === 1 ? 'Photo' : 'Photos'}` : 'Upload'
	const asList = loading || rejections.length > 0

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
			{asList ? null : (
				<p className='text-sm leading-normal text-body dark:text-muted-foreground'>Upload photos of your shopping receipt. We’ll extract the items automatically.</p>
			)}

			<div className='flex flex-col gap-2'>
				{loading ? null : (
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

				<UploadTicketPhotos
					inputId={photosId}
					descriptionId={photosDescriptionId}
					errorId={errors.files ? `${photosId}-error` : undefined}
					previews={previews}
					rejections={rejections}
					max={MAX_IMAGES_PER_TICKET}
					uploading={loading}
					onAdd={addFiles}
					onRemove={removePhoto}
					onDismissRejection={dismissRejection}
				/>
				{errors.files && <p id={`${photosId}-error`} role='alert' className='text-sm text-destructive'>{errors.files.message}</p>}
			</div>

			{loading ? (
				<Alert variant='receipt-notice' role='status' data-testid='upload-ticket-progress'>
					<RowIcon icon={Loading03Icon} tone='primary' size='alert' spinning testId='upload-ticket-progress-icon' />
					<AlertTitle>Uploading your receipt</AlertTitle>
					<AlertDescription>Keep this open while we upload your photos.</AlertDescription>
				</Alert>
			) : previews.length > 0 && rejections.length === 0 ? (
				<Alert variant='receipt-notice' role='note' data-testid='upload-ticket-review-note'>
					<RowIcon icon={InformationCircleIcon} tone='primary' size='alert' testId='upload-ticket-review-note-icon' />
					<AlertTitle>Review before saving</AlertTitle>
					<AlertDescription>We read the <strong className='font-semibold text-slate-900'>store, date and total</strong> from the receipt. You confirm them before anything is saved.</AlertDescription>
				</Alert>
			) : null}

			{/* On a phone the actions stack with Upload on top; from `sm` Cancel sits left and Upload right. */}
			<div className='flex flex-col gap-2 sm:flex-row-reverse sm:justify-start sm:gap-3'>
				<Button
					type='submit'
					size='primary'
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
							variant='secondary'
							size='primary'
							disabled={loading}
							className='w-full sm:w-auto'
						>
							Cancel
						</Button>
					</DialogClose>
				)}
			</div>
			{rejections.length > 0 ? (
				<p className='text-center text-xs leading-[1.4] text-muted-foreground dark:text-muted-foreground'>The photos that failed are left out; the rest still upload.</p>
			) : null}
		</form>
	)
}
