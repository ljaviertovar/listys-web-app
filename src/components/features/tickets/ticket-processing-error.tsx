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
	let errorDetails: string | null = null

	if (error) {
		try {
			// Try to extract OpenAI error
			if (error.includes('OpenAI API error')) {
				const openAiMatch = error.match(/OpenAI API error: ({[\s\S]*})/)
				if (openAiMatch) {
					const errorObj = JSON.parse(openAiMatch[1])
					if (errorObj.error?.message) {
						errorMessage = errorObj.error.message
						errorDetails = errorObj.error.code ? `Error Code: ${errorObj.error.code}` : null
					}
				}
			} else if (error.includes('invalid_image_format')) {
				errorMessage = 'The image format is not supported. Please upload a PNG, JPEG, GIF, or WebP image.'
			} else {
				errorDetails = error
			}
		} catch {
			// If parsing fails, use raw error
			errorDetails = error
		}
	}

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
					{errorDetails && (
						<details className='mt-3'>
							<summary className='cursor-pointer text-xs text-muted-foreground hover:text-foreground'>
								View technical details
							</summary>
							<pre className='mt-2 overflow-x-auto rounded bg-muted p-2 text-xs'>{errorDetails}</pre>
						</details>
					)}
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
