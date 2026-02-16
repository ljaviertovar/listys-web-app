'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { SpamIcon } from '@hugeicons/core-free-icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
	error?: string | null
}

export function TicketProcessingError({ error }: Props) {
	// Parse error message
	let errorTitle = 'Failed to Process Receipt'
	let errorMessage = 'Unable to extract items from this receipt.'

	return (
		<div className='py-8'>
			<Alert variant='warning'>
				<HugeiconsIcon
					icon={SpamIcon}
					strokeWidth={2}
				/>
				<AlertTitle>{errorTitle}</AlertTitle>
				<AlertDescription>
					<p className='mb-2'>{errorMessage}</p>
					<div className='mt-4 space-y-1 text-sm'>
						<p className='font-medium'>What you can do:</p>
						<ul className='list-inside list-disc space-y-1 text-muted-foreground'>
							<li>Try uploading a clearer, high-resolution image</li>
							<li>Make sure the image format is PNG, JPEG, GIF, or WebP</li>
							<li>Ensure the receipt text is clearly visible and not blurry</li>
							<li>Avoid images with heavy shadows or reflections</li>
						</ul>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	)
}
