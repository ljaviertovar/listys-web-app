'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
	imagePaths?: string[]
}

export function TicketImage({ imagePaths = [] }: Props) {
	const [urls, setUrls] = useState<string[]>([])
	const [mainIndex, setMainIndex] = useState(0)
	const [mainLoaded, setMainLoaded] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const touchStartX = useRef<number | null>(null)
	const touchEndX = useRef<number | null>(null)

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
			<div
				className='relative overflow-hidden rounded-lg mb-2 touch-none'
				onTouchStart={e => {
					touchStartX.current = e.touches[0].clientX
					touchEndX.current = null
				}}
				onTouchMove={e => {
					touchEndX.current = e.touches[0].clientX
				}}
				onTouchEnd={() => {
					if (touchStartX.current == null || touchEndX.current == null) return
					const delta = touchStartX.current - touchEndX.current
					const threshold = 50
					if (Math.abs(delta) > threshold) {
						if (delta > 0) {
							setMainIndex(idx => Math.min(urls.length - 1, idx + 1))
						} else {
							setMainIndex(idx => Math.max(0, idx - 1))
						}
					}
					touchStartX.current = null
					touchEndX.current = null
				}}
			>
				<div className='absolute right-2 top-2 z-10 rounded-full bg-black/50 text-white px-2 py-1 text-xs'>
					{mainIndex + 1} / {urls.length}
				</div>

				<img
					src={urls[mainIndex]}
					alt={`Receipt ${mainIndex + 1}`}
					className={`w-full object-contain max-h-[60vh] transition-all duration-200 ${mainLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
					onLoad={() => setMainLoaded(true)}
					onError={() => setError('Failed to load image')}
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
							<img
								src={u}
								alt={`Thumbnail ${i + 1}`}
								className='h-16 w-24 object-cover'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
