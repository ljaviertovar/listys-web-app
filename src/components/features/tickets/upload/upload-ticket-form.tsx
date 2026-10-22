'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import { uploadTicketSchema, type UploadTicketInput } from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'

import { UploadTicketPhotos } from './upload-ticket-photos'
import { usePhotoPicker } from './hooks/use-photo-picker'

interface Props {
	onSuccess?: () => void
	/** Photos the form starts with, for a dialog opened by dropping files on a tile. */
	initialFiles?: File[]
}

export function UploadTicketProgress({ photoCount }: { photoCount: number }) {
	return (
		<div data-testid='upload-ticket-progress' className='flex flex-col gap-2'>
			<span role='progressbar' aria-label='Uploading receipt' className='block h-1.5 overflow-hidden rounded-full bg-slate-200'>
				<span className='block h-full w-2/5 animate-pulse rounded-full bg-blue-600 motion-reduce:animate-none' />
			</span>
			<div className='flex items-center justify-between text-xs text-slate-500'>
				<span className='font-mono font-medium tabular-nums'>
					Uploading {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
				</span>
				<span>Keep this window open</span>
			</div>
		</div>
	)
}

export function UploadTicketForm({ onSuccess, initialFiles }: Props) {
	const router = useRouter()
	const storeNameId = useId()
	const photosId = useId()
	const photosDescriptionId = useId()
	const [loading, setLoading] = useState(false)
	const { previews, rejections, addFiles, removePhoto, dismissRejection } = usePhotoPicker(MAX_IMAGES_PER_TICKET)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<UploadTicketInput>({
		resolver: zodResolver(uploadTicketSchema),
		defaultValues: {
			store_name: '',
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

	// One valid photo is enough to try: a missing name is reported (and focused) on submit instead of leaving the button dead.
	const canSubmit = previews.length > 0 && !loading

	const onSubmit = async (data: UploadTicketInput) => {
		setLoading(true)

		try {
			const formData = new FormData()
			data.files.forEach(file => {
				formData.append('files', file)
			})
			formData.append('store_name', data.store_name)

			const response = await fetch('/api/upload-ticket', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error('We couldn’t upload your receipt. Check your connection and try again.')
			}

			const ticketId = result?.ticketId || result?.data?.id || result?.id || null
			toast.success('Receipt uploaded', {
				description: ticketId ? 'Opening your receipt…' : 'You can review its progress in your receipts.',
			})
			onSuccess?.()
			if (ticketId) {
				router.push(`/tickets/${ticketId}`)
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
			className='flex flex-col gap-5'
		>
			<div className='flex flex-col gap-2'>
					<Label htmlFor={storeNameId}>
						Store or Receipt Name <span aria-hidden='true' className='text-destructive'>*</span>
				</Label>
				<Input
						id={storeNameId}
					{...register('store_name')}
						placeholder='e.g. Grocery Store'
					disabled={loading}
					aria-invalid={errors.store_name ? true : undefined}
						aria-required='true'
						aria-describedby={errors.store_name ? `${storeNameId}-error` : `${storeNameId}-hint`}
					size='lg'
				/>
					{errors.store_name ? (
						<p id={`${storeNameId}-error`} role='alert' className='text-sm text-destructive'>{errors.store_name.message}</p>
					) : (
						<p id={`${storeNameId}-hint`} className='text-xs leading-normal text-muted-foreground'>Use a name you’ll recognize, such as Grocery Store.</p>
					)}
			</div>

			<div className='flex flex-col gap-2'>
				<div className='flex items-center justify-between'>
					<Label htmlFor={photosId}>
						Photos <span aria-hidden='true' className='text-destructive'>*</span>
					</Label>
					<span
						aria-live='polite'
						className='font-mono text-xs font-medium text-slate-500 tabular-nums'
					>
						{previews.length} / {MAX_IMAGES_PER_TICKET}
					</span>
				</div>

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

				{previews.length > 1 && !loading ? (
					<p className='text-xs leading-normal text-slate-500'>
						For long receipts, add the photos from top to bottom. Duplicates at the edges are merged automatically.
					</p>
				) : null}
			</div>

			{loading ? (
				<UploadTicketProgress photoCount={previews.length} />
			) : null}

			{/* On a phone the buttons take the full width under the note; from `sm` the note sits left and the buttons right. */}
			<div className='mt-1 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
				<p className='text-xs text-slate-500'>
					<span className='text-destructive'>*</span> Required fields
				</p>
				<DialogFooter variant='inline'>
					<DialogClose asChild>
						<Button
							type='button'
							variant='secondary'
							size='primary'
							disabled={loading}
							className='flex-1 sm:flex-none'
						>
							Cancel
						</Button>
					</DialogClose>
					<Button
						type='submit'
						size='primary'
						disabled={!canSubmit}
						className='flex-1 sm:flex-none'
					>
						{loading ? (
							<>
								<HugeiconsIcon
									icon={Loading03Icon}
									strokeWidth={2}
									className='size-4 animate-spin motion-reduce:animate-none'
								/>
								Uploading Receipt…
							</>
						) : (
							'Upload Receipt'
						)}
					</Button>
				</DialogFooter>
			</div>
		</form>
	)
}
