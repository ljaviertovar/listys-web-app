'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageUploadIcon, Loading03Icon } from '@hugeicons/core-free-icons'

interface Props {
	onSuccess?: () => void
}

export function UploadTicketForm({ onSuccess }: Props) {
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [storeName, setStoreName] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			if (!selectedFile.type.startsWith('image/')) {
				setError('Please select an image file')
				return
			}
			if (selectedFile.size > 10 * 1024 * 1024) {
				setError('File size must be less than 10MB')
				return
			}
			setFile(selectedFile)
			setError(null)

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
			if (!droppedFile.type.startsWith('image/')) {
				setError('Please select an image file')
				return
			}
			if (droppedFile.size > 10 * 1024 * 1024) {
				setError('File size must be less than 10MB')
				return
			}
			setFile(droppedFile)
			setError(null)

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!file) {
			setError('Please select a file')
			return
		}

		setLoading(true)
		setError(null)

		try {
			const formData = new FormData()
			formData.append('file', file)
			if (storeName) {
				formData.append('store_name', storeName)
			}

			const response = await fetch('/api/upload-ticket', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Upload failed')
			}

			onSuccess?.()
		} catch (err: any) {
			setError(err.message || 'Failed to upload ticket')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			<div className='space-y-2'>
				<Label htmlFor='store_name'>Store Name (optional)</Label>
				<Input
					id='store_name'
					value={storeName}
					onChange={e => setStoreName(e.target.value)}
					placeholder='e.g., Walmart, Target'
				/>
			</div>

			<div className='space-y-2'>
				<Label>Receipt Image</Label>
				<div
					onClick={() => fileInputRef.current?.click()}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					className={`
						flex min-h-[200px] cursor-pointer flex-col items-center justify-center
						rounded-lg border-2 border-dashed transition-colors
						${preview ? 'border-primary' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
					`}
				>
					{preview ? (
						<img
							src={preview}
							alt='Receipt preview'
							className='max-h-[300px] rounded-lg object-contain p-2'
						/>
					) : (
						<div className='flex flex-col items-center gap-2 p-6 text-center'>
							<HugeiconsIcon
								icon={ImageUploadIcon}
								strokeWidth={1.5}
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
			</div>

			{error && <p className='text-sm text-destructive'>{error}</p>}

			<div className='flex justify-end gap-2'>
				<Button
					type='submit'
					disabled={!file || loading}
				>
					{loading ? (
						<>
							<HugeiconsIcon
								icon={Loading03Icon}
								strokeWidth={2}
								className='mr-2 h-4 w-4 animate-spin'
							/>
							Uploading...
						</>
					) : (
						'Upload & Process'
					)}
				</Button>
			</div>
		</form>
	)
}
