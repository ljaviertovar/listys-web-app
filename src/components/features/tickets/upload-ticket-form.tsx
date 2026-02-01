'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadTicketSchema, type UploadTicketInput } from '@/lib/validations/ticket'

import { Loading03Icon, Upload06Icon } from '@hugeicons/core-free-icons'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'

interface Props {
	onSuccess?: () => void
}

export function UploadTicketForm({ onSuccess }: Props) {
	const [preview, setPreview] = useState<string | null>(null)
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
	})

	const file = watch('file')

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			setValue('file', selectedFile, { shouldValidate: true })

			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreview(reader.result as string)
			}
			reader.readAsDataURL(selectedFile)
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const droppedFile = e.dataTransfer.files?.[0]
		if (droppedFile) {
			setValue('file', droppedFile, { shouldValidate: true })

			const reader = new FileReader()
			reader.onloadend = () => {
				setPreview(reader.result as string)
			}
			reader.readAsDataURL(droppedFile)
		}
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const onSubmit = async (data: UploadTicketInput) => {
		setLoading(true)

		try {
			const formData = new FormData()
			formData.append('file', data.file)
			formData.append('store_name', data.store_name)

			const response = await fetch('/api/upload-ticket', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Upload failed')
			}

			toast.success('Ticket uploaded successfully!')
			onSuccess?.()
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
					Photo <span className='text-destructive'>*</span>
				</Label>
				<div
					onClick={() => fileInputRef.current?.click()}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					className={`
						flex min-h-50 cursor-pointer flex-col items-center justify-center
						rounded-lg border-2 border-dashed transition-colors
						${preview ? 'border-primary' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
					`}
				>
					{preview ? (
						<img
							src={preview}
							alt='Receipt preview'
							className='max-h-75 rounded-lg object-contain p-2'
						/>
					) : (
						<div className='flex flex-col items-center gap-2 p-6 text-center'>
							<HugeiconsIcon
								icon={Upload06Icon}
								strokeWidth={2}
								className='h-12 w-12 text-muted-foreground'
							/>
							<div>
								<p className='font-medium'>Click to upload or drag and drop</p>
								<p className='text-sm text-muted-foreground'>PNG, JPG up to 10MB</p>
							</div>
						</div>
					)}
				</div>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleFileChange}
					className='hidden'
					aria-label='Upload receipt image'
				/>
				{errors.file && <p className='text-sm text-destructive'>{errors.file.message}</p>}
			</div>

			<p className='text-xs text-muted-foreground'>
				<span className='text-destructive'>*</span> Required fields
			</p>

			<DialogFooter className='mt-6 mb-0'>
				<DialogClose asChild>
					<Button variant='outline'>Cancel</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={!file || loading}
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
