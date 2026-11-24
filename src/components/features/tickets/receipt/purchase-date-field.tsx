'use client'

import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Alert02Icon, Calendar03Icon, Edit02Icon, Loading03Icon, Note01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { FormField } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { EARLIEST_PURCHASE_DAY, dayInTimeZone, weekdayOfDay } from './helpers/purchase-date'
import { useBrowserTimeZone } from './hooks/use-browser-time-zone'
import { useTicketPurchaseDate } from './hooks/use-ticket-purchase-date'

export interface PurchaseDateInfo {
	/** The date read from the receipt, or the one the person set; null when the read found none. */
	day: string | null
	/** The person chose the date: reading the receipt again keeps it. */
	byUser: boolean
	uploadedAt: string | null
	/** The receipt counts in This Month and All Time, so moving its date can move it to another month. */
	countsInSpending: boolean
}

interface PurchaseDateFieldProps extends PurchaseDateInfo {
	ticketId: string
}

/** A calendar day (YYYY-MM-DD) as a local Date, so the calendar shows that day whatever the time zone. */
function dayToDate(day: string): Date {
	const [year, month, date] = day.split('-').map(Number)
	return new Date(year, month - 1, date)
}

/** The local Date of the calendar back as YYYY-MM-DD. */
function dateToDay(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * The receipt's purchase date, editable under the store (canvas R3, option A). The read can miss the date or take the wrong
 * day, and the date decides which month the receipt counts in, so the field says where its date came from: read from the
 * receipt, not found (the upload date stands in) or set by the person. The day is picked on a calendar (shadcn Popover and
 * Calendar), limited to the range the server accepts.
 */
export function PurchaseDateField({ ticketId, day, byUser, uploadedAt, countsInSpending }: PurchaseDateFieldProps) {
	const triggerId = useId()
	const statusId = `${triggerId}-status`
	const [open, setOpen] = useState(false)
	const timeZone = useBrowserTimeZone()
	const today = dayInTimeZone(new Date(), timeZone)
	const shownDay = day ?? (uploadedAt ? dayInTimeZone(uploadedAt, timeZone) : today)
	const { value, saving, error, savedMessage, canRetry, choose, retry } = useTicketPurchaseDate({ ticketId, shownDay, today, countsInSpending })
	const weekday = weekdayOfDay(value)
	const label = value
		? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
		: 'Pick a date'

	let tone = 'text-muted-foreground'
	let icon: IconSvgElement = Note01Icon
	let message: ReactNode = 'Read from the receipt.'
	if (saving) {
		icon = Loading03Icon
		message = 'Saving…'
	} else if (savedMessage) {
		tone = 'text-feedback-success'
		icon = Tick02Icon
		message = savedMessage
	} else if (!day) {
		tone = 'text-feedback-warning'
		icon = Alert02Icon
		message = (
			<>
				<span className='font-semibold'>Not found on the receipt.</span> The upload date is used until you set the date printed on it.
			</>
		)
	} else if (byUser) {
		icon = Edit02Icon
		message = 'Set by you.'
	}
	// The weekday is for checking the day against the paper; it only goes with a day that is a real one on the receipt.
	const showWeekday = weekday && day && !saving && !savedMessage

	// An error takes the place of the status line (FormField shows one or the other).
	const status = (
		<span id={statusId} role='status' className={`flex items-start gap-1.5 ${tone}`}>
			<HugeiconsIcon
				icon={icon}
				strokeWidth={1.8}
				aria-hidden='true'
				className={`mt-0.5 size-4 shrink-0 ${saving ? 'animate-spin motion-reduce:animate-none' : ''}`}
			/>
			<span>
				{showWeekday ? `${weekday} · ` : null}
				{message}
			</span>
		</span>
	)

	const pick = (next: Date | undefined) => {
		if (!next) return
		setOpen(false)
		choose(dateToDay(next))
	}

	return (
		<div data-testid='purchase-date-field' className='flex flex-col gap-2'>
			<FormField htmlFor={triggerId} label='Purchase date' hint={status} error={error} testId='purchase-date-input-field'>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							id={triggerId}
							type='button'
							variant='field'
							size='lg'
							data-empty={!value}
							aria-invalid={error ? true : undefined}
							aria-describedby={error ? `${triggerId}-error` : statusId}
							className='w-full'
						>
							<HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.6} aria-hidden='true' />
							{label}
						</Button>
					</PopoverTrigger>
					<PopoverContent variant='calendar' align='start'>
						<Calendar
							mode='single'
							selected={value ? dayToDate(value) : undefined}
							onSelect={pick}
							defaultMonth={value ? dayToDate(value) : dayToDate(today)}
							disabled={[{ after: dayToDate(today) }, { before: dayToDate(EARLIEST_PURCHASE_DAY) }]}
						/>
					</PopoverContent>
				</Popover>
			</FormField>
			{canRetry ? (
				<Button type='button' variant='secondary' size='lg' className='self-start' onClick={retry}>
					Try Again
				</Button>
			) : null}
		</div>
	)
}
