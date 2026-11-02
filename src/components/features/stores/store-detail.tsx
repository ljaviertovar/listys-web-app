'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ConfirmSheet } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { removeStoreName } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'
import type { StoreDetail, StoreReceiptName } from '@/types'

interface StoreDetailProps {
	store: StoreDetail
}

/** One store: how many receipts and usual items it has, what was spent there this year, and the names its receipts print. */
export function StoreDetailView({ store }: StoreDetailProps) {
	const router = useRouter()
	const [removing, setRemoving] = useState<StoreReceiptName | null>(null)
	const [pending, setPending] = useState(false)

	const handleRemove = async () => {
		if (!removing || pending) return
		setPending(true)
		const { error } = await removeStoreName(store.id, removing.id)
		setPending(false)
		if (error) {
			toast.error('We couldn’t remove this name. Try again.')
			return
		}
		setRemoving(null)
		toast.success('Name removed')
		router.refresh()
	}

	// The window starts on 1 January UTC: the year is read in UTC too, or a viewer west of Greenwich would see 31 December.
	const sinceYear = new Date(store.spent_since).getUTCFullYear()

	return (
		<div
			data-testid='store-detail'
			className='flex w-full max-w-3xl flex-col gap-6'
		>
			<section
				aria-label='Store totals'
				className='grid grid-cols-3 gap-3'
			>
				<Stat
					testId='store-detail-receipts'
					value={String(store.receipt_count)}
					label={store.receipt_count === 1 ? 'Receipt' : 'Receipts'}
				/>
				<Stat
					testId='store-detail-usual-items'
					value={String(store.usual_items_count ?? 0)}
					label='Items usually here'
				/>
				<Stat
					testId='store-detail-spent'
					value={formatCurrency(store.spent_total)}
					label={`Spent since Jan ${sinceYear}`}
				/>
			</section>

			<section
				data-testid='store-detail-names'
				className='flex flex-col gap-3'
			>
				<div className='flex flex-col gap-1'>
					<h2 className='font-display text-base leading-[1.5] font-semibold'>Names on receipts</h2>
					<p className='text-sm leading-normal text-muted-foreground'>Receipts that print any of these go to {store.name}.</p>
				</div>
				<Card size='tight'>
					<ul className='flex flex-col divide-y divide-slate-100 dark:divide-border'>
						{store.names.map(name => (
							<li
								key={name.id}
								className='flex min-h-12 items-center justify-between gap-3'
							>
								<span className='min-w-0 flex-1 break-words text-sm font-medium'>{name.name}</span>
								{name.removable ? (
									<Button
										type='button'
										variant='quiet'
										size='touch'
										aria-label={`Remove ${name.name}`}
										onClick={() => setRemoving(name)}
									>
										Remove
									</Button>
								) : (
									<span className='text-xs text-muted-foreground'>Store name</span>
								)}
							</li>
						))}
					</ul>
				</Card>
			</section>

			<ConfirmSheet
				open={removing !== null}
				onOpenChange={open => !open && !pending && setRemoving(null)}
				title={removing ? `Remove “${removing.name}”?` : 'Remove name?'}
				description='Receipts that print this name will ask you which store they belong to.'
				confirmLabel='Remove Name'
				loadingLabel='Removing…'
				tone='danger'
				loading={pending}
				onConfirm={handleRemove}
				testId='store-name-remove-confirm'
			/>
		</div>
	)
}

function Stat({ value, label, testId }: { value: string; label: string; testId: string }) {
	return (
		<Card
			size='tight'
			data-testid={testId}
		>
			<div className='flex flex-col gap-1'>
				<b className='font-mono text-lg leading-none font-bold tabular-nums'>{value}</b>
				<span className='text-xs leading-[1.3] text-muted-foreground'>{label}</span>
			</div>
		</Card>
	)
}
