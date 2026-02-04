'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadTicketSchema, type UploadTicketInput } from '@/lib/validations/ticket'
import { MAX_IMAGES_PER_TICKET } from '@/lib/config/limits'
import { Loading03Icon, Upload06Icon, Cancel01Icon, Image02Icon } from '@hugeicons/core-free-icons'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'

interface Props {
	onSuccess?: () => void
}

interface ImagePreview {
	file: File
	preview: string
}

export function UploadTicketForm({ onSuccess }: Props) {
	const router = useRouter()
	const [previews, setPreviews] = useState<ImagePreview[]>([])
	const [loading, setLoading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<UploadTicketInput>({
		resolver: zodResolver(uploadTicketSchema),
		defaultValues: {
			files: [],
		},
	})

	const files = watch('files')

	const addFiles = (newFiles: FileList | File[]) => {
		const fileArray = Array.from(newFiles)
		const currentCount = previews.length
		const availableSlots = MAX_IMAGES_PER_TICKET - currentCount

		if (availableSlots <= 0) {
			toast.error(`Maximum ${MAX_IMAGES_PER_TICKET} images allowed`)
			return
		}

		const filesToAdd = fileArray.slice(0, availableSlots)
		if (fileArray.length > availableSlots) {
			toast.warning(`Only ${availableSlots} more image(s) can be added`)
		}

		// Detect unsupported types (HEIC/HEIF) and skip them
		const isHeic = (f: File) => {
			const t = (f.type || '').toLowerCase()
			const name = f.name.toLowerCase()
			return t.includes('heic') || t.includes('heif') || /\.heic$/i.test(name) || /\.heif$/i.test(name)
		}

		const invalidFiles = filesToAdd.filter(isHeic)
		const validFiles = filesToAdd.filter(f => !isHeic(f))

		if (invalidFiles.length > 0) {
			toast.error(`Some files are HEIC/HEIF and are not supported. Please convert them to JPG/PNG before uploading.`)
		}

		// Create previews for valid files only
		validFiles.forEach(file => {
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviews(prev => {
					const updated = [...prev, { file, preview: reader.result as string }]
					// Update form value
					setValue(
						'files',
						updated.map(p => p.file),
						{ shouldValidate: true },
					)
					return updated
				})
			}
			reader.readAsDataURL(file)
		})
	}

	const removeImage = (index: number) => {
		setPreviews(prev => {
			const updated = prev.filter((_, i) => i !== index)
			setValue(
				'files',
				updated.map(p => p.file),
				{ shouldValidate: true },
			)
			return updated
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files
		if (selectedFiles && selectedFiles.length > 0) {
			addFiles(selectedFiles)
		}
		// Reset input to allow selecting same file again
		e.target.value = ''
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const droppedFiles = e.dataTransfer.files
		if (droppedFiles && droppedFiles.length > 0) {
			addFiles(droppedFiles)
		}
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

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
				throw new Error(result.error || 'Upload failed')
			}

			// Navigate immediately to the ticket page showing `pending` status
			const ticketId = result?.data?.id || result?.id || null
			toast.success('Ticket created — redirecting...')
			onSuccess?.()
			if (ticketId) {
				router.push(`/tickets/${ticketId}`)
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to upload ticket'
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='space-y-4'
		>
			<div className='space-y-2'>
				<Label htmlFor='store_name'>
					Name <span className='text-destructive'>*</span>
				</Label>
				<Input
					id='store_name'
					{...register('store_name')}
					placeholder='e.g. Walmart, Grocery Store'
					disabled={loading}
					className='text-base'
				/>
				{errors.store_name && <p className='text-sm text-destructive'>{errors.store_name.message}</p>}
			</div>

			<div className='space-y-2'>
				<Label>
					Photos <span className='text-destructive'>*</span>
					<span className='ml-2 text-xs font-normal text-muted-foreground'>
						({previews.length}/{MAX_IMAGES_PER_TICKET})
					</span>
				</Label>

				{/* Image previews grid */}
				{previews.length > 0 && (
					<div className='grid grid-cols-3 gap-2 sm:grid-cols-5'>
						{previews.map((item, index) => (
							<div
								key={index}
								className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'
							>
								<img
									src={item.preview}
									alt={`Receipt part ${index + 1}`}
									className='h-full w-full object-cover'
								/>
								<div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
									<span className='text-xs font-medium text-white'>Part {index + 1}</span>
								</div>
								<button
									type='button'
									onClick={() => removeImage(index)}
									disabled={loading}
									title='Remove image'
									className='absolute top-1 right-1 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed'
								>
									<HugeiconsIcon
										icon={Cancel01Icon}
										strokeWidth={2}
										className='h-3 w-3'
									/>
								</button>
								{index === 0 && (
									<span className='absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground'>
										Top
									</span>
								)}
								{index === previews.length - 1 && previews.length > 1 && (
									<span className='absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground'>
										Bottom
									</span>
								)}
							</div>
						))}
					</div>
				)}

				{/* Upload area */}
				{previews.length < MAX_IMAGES_PER_TICKET && (
					<div
						onClick={() => fileInputRef.current?.click()}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						className={`
							flex cursor-pointer flex-col items-center justify-center
							rounded-lg border-2 border-dashed transition-colors
							${previews.length > 0 ? 'min-h-24 border-muted-foreground/25 hover:border-muted-foreground/50' : 'min-h-50 border-muted-foreground/25 hover:border-muted-foreground/50'}
						`}
					>
						<div className='flex flex-col items-center gap-2 p-4 text-center'>
							<HugeiconsIcon
								icon={previews.length > 0 ? Image02Icon : Upload06Icon}
								strokeWidth={2}
								className={`text-muted-foreground ${previews.length > 0 ? 'h-8 w-8' : 'h-12 w-12'}`}
							/>
							<div>
								<p className='font-medium'>
									{previews.length > 0 ? 'Add more photos' : 'Click to upload or drag and drop'}
								</p>
								<p className='text-sm text-muted-foreground'>
									{previews.length > 0
										? `${MAX_IMAGES_PER_TICKET - previews.length} more allowed`
										: `Up to ${MAX_IMAGES_PER_TICKET} photos • PNG, JPG (no HEIC) up to 10MB each`}
								</p>
							</div>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type='file'
					accept='image/png,image/jpeg'
					multiple
					onChange={handleFileChange}
					className='hidden'
					aria-label='Upload receipt images'
				/>
				{errors.files && <p className='text-sm text-destructive'>{errors.files.message}</p>}

				{previews.length > 1 && (
					<p className='text-xs text-muted-foreground'>
						💡 Tip: For long receipts, photos are processed top to bottom. Duplicates at borders are automatically
						merged.
					</p>
				)}
			</div>

			<p className='text-xs text-muted-foreground'>
				<span className='text-destructive'>*</span> Required fields
			</p>

			<DialogFooter className='flex-row gap-4 mt-6 mb-0'>
				<DialogClose asChild>
					<Button
						variant='outline'
						className='flex-1'
					>
						Cancel
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={!files || files.length === 0 || loading}
					className='flex-1'
				>
					{loading ? (
						<>
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={2}
								className='h-4 w-4 animate-spin'
							/>
							Uploading...
						</>
					) : (
						'Upload'
					)}
				</Button>
			</DialogFooter>
		</form>
	)
}
