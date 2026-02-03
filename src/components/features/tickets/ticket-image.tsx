'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
	imagePaths?: string[]
}

export function TicketImage({ imagePaths = [] }: Props) {
	const [urls, setUrls] = useState<string[]>([])
	const [mainIndex, setMainIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!imagePaths || imagePaths.length === 0) {
			setLoading(false)
			setUrls([])
			return
		}

		let mounted = true

		const loadAll = async () => {
			try {
				const supabase = createClient()
				const urlsAcc: string[] = []

				for (const path of imagePaths) {
					try {
						const { data, error: urlError } = await supabase.storage.from('tickets').createSignedUrl(path, 60 * 60)
						if (urlError || !data?.signedUrl) {
							console.error('Error creating signed URL for', path, urlError)
							continue
						}
						urlsAcc.push(data.signedUrl)
					} catch (e) {
						console.error('Error creating signed URL for', path, e)
					}
				}

				if (mounted) {
					setUrls(urlsAcc)
				}
			} catch (err) {
				console.error('Error loading images:', err)
				if (mounted) setError('Failed to load images')
			} finally {
				if (mounted) setLoading(false)
			}
		}

		loadAll()

		return () => {
			mounted = false
		}
	}, [imagePaths])

	if (loading) {
		return (
			<div className='flex h-[400px] items-center justify-center rounded-lg bg-muted'>
				<p className='text-sm text-muted-foreground'>Loading image...</p>
			</div>
		)
	}

	if (error || urls.length === 0) {
		return (
			<div className='flex h-[400px] items-center justify-center rounded-lg bg-muted'>
				<p className='text-sm text-muted-foreground'>{error || 'Image not available'}</p>
			</div>
		)
	}

	return (
		<div>
			<div className='overflow-hidden rounded-lg mb-2'>
				<img
					src={urls[mainIndex]}
					alt={`Receipt ${mainIndex + 1}`}
					className='w-full object-contain max-h-[60vh]'
				/>
			</div>

			{urls.length > 1 && (
				<div className='flex gap-2 overflow-x-auto'>
					{urls.map((u, i) => (
						<button
							key={u}
							onClick={() => setMainIndex(i)}
							className={`rounded border ${i === mainIndex ? 'border-primary' : 'border-transparent'} p-0.5`}
							aria-label={`Show image ${i + 1}`}
						>
							<img src={u} alt={`Thumbnail ${i + 1}`} className='h-16 w-24 object-cover' />
						</button>
					))}
				</div>
			)}
		</div>
	)
}
