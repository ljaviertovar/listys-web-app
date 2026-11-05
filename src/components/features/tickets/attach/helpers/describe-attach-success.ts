import type { AttachTicketToSessionSummary } from '@/lib/api/endpoints'

export function describeAttachSuccess(summary?: AttachTicketToSessionSummary) {
	return {
		title: summary?.completed_now ? 'Receipt attached and trip completed' : 'Receipt attached',
		description: summary && summary.over_limit_count > 0
			? `${summary.over_limit_count} new ${summary.over_limit_count === 1 ? 'item was' : 'items were'} saved to the trip but not to your list because it’s full.`
			: undefined,
	}
}
