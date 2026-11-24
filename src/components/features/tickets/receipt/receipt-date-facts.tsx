'use client'

import { useBrowserTimeZone } from './hooks/use-browser-time-zone'

const dayAndMonth = { month: 'short', day: 'numeric' } as const
const withYear = { ...dayAndMonth, year: 'numeric' } as const
const printedDay = new Intl.DateTimeFormat('en-GB', { ...dayAndMonth, timeZone: 'UTC' })
const printedDayWithYear = new Intl.DateTimeFormat('en-GB', { ...withYear, timeZone: 'UTC' })

export function ReceiptDateFacts({
	uploadedAt,
	purchaseDate,
	testId,
}: {
	uploadedAt: string | null
	purchaseDate: string | null
	testId: string
}) {
	const timeZone = useBrowserTimeZone()
	const upload = uploadedAt ? new Date(uploadedAt) : null
	const validUpload = upload && Number.isFinite(upload.getTime()) ? upload : null
	const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone })
	const currentYear = year.format()
	const uploadedDateFormat = validUpload && year.format(validUpload) !== currentYear ? withYear : dayAndMonth
	const uploadedDate = validUpload
		? new Intl.DateTimeFormat('en-GB', { ...uploadedDateFormat, timeZone }).format(validUpload)
		: null
	const uploadedTime = validUpload
		? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(validUpload)
		: null
	const printedDateFormat = purchaseDate?.slice(0, 4) === currentYear ? printedDay : printedDayWithYear

	return (
		<span data-testid={testId}>
			{uploadedDate && uploadedTime && uploadedAt ? (
				<span className='whitespace-nowrap'>
					Uploaded{' '}
					<time className='font-mono' dateTime={uploadedAt}>
						{uploadedDate}, {uploadedTime}
					</time>
				</span>
			) : (
				'Upload date unknown'
			)}
			<span aria-hidden='true'> · </span>
			<span className='whitespace-nowrap'>
				Purchase date{' '}
				{purchaseDate ? (
					<time className='font-mono' dateTime={purchaseDate}>
						{printedDateFormat.format(new Date(`${purchaseDate}T00:00:00Z`))}
					</time>
				) : uploadedDate ? (
					<>
						<span className='font-mono'>{uploadedDate}</span> (upload date)
					</>
				) : (
					'unknown'
				)}
			</span>
		</span>
	)
}
