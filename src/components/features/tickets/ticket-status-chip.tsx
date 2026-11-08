import { cn } from '@/utils'

import { TICKET_STATUS_META, type TicketStatus } from './helpers/ticket-status'

interface TicketStatusChipProps {
	status: TicketStatus
	label?: string
	className?: string
	testId?: string
}

/**
 * Status chip of the design system (canvas 3/7): the one filled pill, 22px, tinted with the colour of its status, with a 6px dot and text of
 * that colour. It is deliberately not the shape of a button (12px radius, grey, 40px) so it never reads as something to press.
 */
export function TicketStatusChip({ status, label, className, testId = 'ticket-status-chip' }: TicketStatusChipProps) {
	const meta = TICKET_STATUS_META[status]

	return (
		<span
			data-testid={testId}
			data-status={status}
			className={cn(
				'inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full px-2 font-sans text-xs leading-none font-semibold whitespace-nowrap',
				meta.tone,
				className,
			)}
		>
			<span
				aria-hidden='true'
				className='size-1.5 shrink-0 rounded-full bg-current'
			/>
			{label ?? meta.label}
		</span>
	)
}
