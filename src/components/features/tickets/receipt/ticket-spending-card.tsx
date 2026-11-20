'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, PieChart02Icon } from '@hugeicons/core-free-icons'

import { RowIcon } from '@/components/commons'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { updateTicketSpending } from '@/lib/api/endpoints'

/** The line under the title: what the switch does to this receipt right now. */
function getSpendingDescription({ included, hasTotal }: { included: boolean; hasTotal: boolean }) {
	if (!hasTotal) return 'Needs a recorded total to count.'
	return included ? 'Counted in This Month and All Time.' : 'Left out of This Month and All Time.'
}

/**
 * Whether the receipt counts in spending, in the same row as the store and photo cards around it: a tile, a title and one
 * line that says the state, with the switch at the end. The state is said once; there is no second badge.
 */
export function TicketSpendingCard({ ticketId, included, hasTotal }: {
	ticketId: string
	included: boolean
	hasTotal: boolean
}) {
	const switchId = useId()
	const router = useRouter()
	const [saving, startSaving] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function save(include: boolean) {
		if (saving || (include && !hasTotal)) return
		setError(null)
		startSaving(async () => {
			try {
				const result = await updateTicketSpending(ticketId, include)
				if (result.error || !result.data) {
					setError(result.error ?? 'Unable to save. Try again.')
					return
				}
				router.refresh()
			} catch {
				setError('Unable to save. Try again.')
			}
		})
	}

	return (
		<Card size='receipt' data-testid='receipt-spending-preference'>
			<div className='flex flex-col gap-2'>
				<div className='flex items-center gap-3'>
					<RowIcon
						icon={PieChart02Icon}
						tone='primary'
						size='lg'
					/>
					<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
						<label
							htmlFor={switchId}
							className='font-display text-base leading-normal font-semibold'
						>
							Count in spending
						</label>
						<p
							id={`${switchId}-help`}
							role={saving ? 'status' : undefined}
							className='flex items-center gap-1.5 text-sm leading-5 text-balance text-muted-foreground'
						>
							{saving ? (
								<>
									<HugeiconsIcon
										icon={Loading03Icon}
										strokeWidth={2}
										aria-hidden='true'
										className='size-3.5 shrink-0 animate-spin motion-reduce:animate-none'
									/>
									Saving…
								</>
							) : (
								getSpendingDescription({ included, hasTotal })
							)}
						</p>
					</div>
					<Switch
						id={switchId}
						checked={included}
						disabled={saving || (!hasTotal && !included)}
						onCheckedChange={save}
						aria-describedby={`${switchId}-help`}
					/>
				</div>
				{error ? <p role='alert' className='text-sm text-feedback-error'>{error}</p> : null}
			</div>
		</Card>
	)
}
