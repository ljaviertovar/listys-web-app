'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
	imagePath: string
}

export function TicketImage({ imagePath }: Props) {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadImage = async () => {
			try {
				const supabase = createClient()

				// Use signed URL for private buckets
				const { data, error: urlError } = await supabase.storage.from('tickets').createSignedUrl(imagePath, 60 * 60) // Valid for 1 hour

				if (urlError) {
					console.error('Error creating signed URL:', urlError)
					setError('Failed to load image')
					return
				}

				if (data?.signedUrl) {
					setImageUrl(data.signedUrl)
				} else {
					setError('Failed to load image')
				}
			} catch (err) {
				console.error('Error loading image:', err)
				setError('Failed to load image')
			} finally {
				setLoading(false)
			}
		}

		loadImage()
	}, [imagePath])

	if (loading) {
		return (
			<div className='flex h-[400px] items-center justify-center rounded-lg bg-muted'>
				<p className='text-sm text-muted-foreground'>Loading image...</p>
			</div>
		)
	}

	if (error || !imageUrl) {
		return (
			<div className='flex h-[400px] items-center justify-center rounded-lg bg-muted'>
				<p className='text-sm text-muted-foreground'>{error || 'Image not available'}</p>
			</div>
		)
	}

	return (
		<div className='overflow-hidden rounded-lg'>
			<img
				src={imageUrl}
				alt='Receipt'
				className='w-full object-contain'
			/>
		</div>
	)
}
