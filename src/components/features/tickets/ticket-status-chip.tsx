import { Badge } from '@/components/ui/badge'

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
		<Badge
			variant={meta.variant}
			dot
			data-testid={testId}
			data-status={status}
			className={className}
		>
			{label ?? meta.label}
		</Badge>
	)
}
