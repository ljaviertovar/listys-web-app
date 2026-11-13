'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Cancel01Icon, Dollar01Icon, GitMergeIcon, InformationCircleIcon, Invoice01Icon, ListViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

import { ConfirmSheet, RowIcon } from '@/components/commons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUndoableAction } from '@/hooks'
import { removeStoreName } from '@/lib/api/endpoints'
import { formatCurrency } from '@/utils'
import type { Store, StoreDetail, StoreReceiptName } from '@/types'

import { mergeStoresAction } from './helpers/store-actions'
import { StorePickerDialog, type StorePick } from './store-picker-dialog'

interface StoreDetailProps {
	store: StoreDetail
}

/** One store: how many receipts and usual items it has, what was spent there this year, and the names its receipts print. */
export function StoreDetailView({ store }: StoreDetailProps) {
	const router = useRouter()
	const [removing, setRemoving] = useState<StoreReceiptName | null>(null)
	const [removePending, setRemovePending] = useState(false)
	const [mergePickerOpen, setMergePickerOpen] = useState(false)
	const [mergeTarget, setMergeTarget] = useState<Store | null>(null)
	const [mergeConfirmOpen, setMergeConfirmOpen] = useState(false)
	const undoableMerge = useUndoableAction()

	const handleRemove = async () => {
		if (!removing || removePending) return
		setRemovePending(true)
		const { error } = await removeStoreName(store.id, removing.id)
		setRemovePending(false)
		if (error) {
			toast.error('We couldn’t remove this name. Try again.')
			return
		}
		setRemoving(null)
		toast.success('Name removed')
		router.refresh()
	}

	const handlePickStore = (pick: StorePick) => {
		if (pick.kind !== 'existing') return
		setMergeTarget(pick.store)
		setMergePickerOpen(false)
		setMergeConfirmOpen(true)
	}

	const handleMerge = () => {
		if (!mergeTarget || undoableMerge.pending) return
		const target = mergeTarget
		setMergeConfirmOpen(false)
		undoableMerge.schedule({
			message: `Merged “${store.name}” into “${target.name}”`,
			run: async () => {
				const result = await mergeStoresAction(target.id, store.id)
				if (result.kind !== 'done') return { error: result.message }
				router.replace(`/stores/${target.id}`)
				return { error: null }
			},
		})
	}

	// The window starts on 1 January UTC: the year is read in UTC too, or a viewer west of Greenwich would see 31 December.
	const sinceYear = new Date(store.spent_since).getUTCFullYear()

	return (
		<div
			data-testid='store-detail'
			className='flex w-full max-w-3xl flex-col gap-4'
		>
			<section
				aria-label='Store totals'
				className='grid grid-cols-2 gap-2.5'
			>
				<Stat
					className='col-span-2'
					icon={Dollar01Icon}
					tone='success'
					value={formatCurrency(store.spent_total)}
					label={`Spent since Jan ${sinceYear}`}
					testId='store-detail-spent'
				/>
				<Stat
					icon={Invoice01Icon}
					tone='ocr'
					value={String(store.receipt_count)}
					label={store.receipt_count === 1 ? 'Receipt' : 'Receipts'}
					testId='store-detail-receipts'
				/>
				<Stat
					icon={ListViewIcon}
					tone='primary'
					value={String(store.usual_items_count ?? 0)}
					label='Items usually here'
					testId='store-detail-usual-items'
				/>
			</section>

			<Card
				data-testid='store-detail-names'
				aria-labelledby='store-detail-names-title'
				size='stat'
			>
				<div className='flex flex-col gap-1'>
					<h2 id='store-detail-names-title' className='text-xs leading-tight font-semibold tracking-wide text-body uppercase'>Names on receipts</h2>
					<p className='text-xs leading-normal text-muted-foreground'>Receipts that print any of these go to {store.name}.</p>
				</div>
				<ul className='flex flex-col divide-y divide-slate-200 overflow-hidden rounded-2xl bg-secondary dark:divide-border dark:bg-muted'>
					{store.names.map(name => (
						<li key={name.id} data-testid={`store-receipt-name-${name.id}`} className='flex min-h-12 items-center justify-between gap-3 px-3'>
							<span className='min-w-0 flex-1 break-words text-sm font-medium'>{name.name}</span>
							{name.removable ? (
								<Button
									type='button'
									variant='quiet'
									size='icon-xl'
									aria-label={`Remove ${name.name}`}
									disabled={removePending || undoableMerge.pending}
									onClick={() => setRemoving(name)}
								>
									<HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} aria-hidden='true' className='size-4' />
								</Button>
							) : <Badge variant='tag'>Store name</Badge>}
						</li>
					))}
				</ul>
			</Card>

			<Button
				type='button'
				variant='outline-surface'
				size='lg'
				className='w-full'
				disabled={undoableMerge.pending || removePending}
				onClick={() => setMergePickerOpen(true)}
			>
				<HugeiconsIcon icon={GitMergeIcon} strokeWidth={1.8} aria-hidden='true' />
				Merge with Another Store
			</Button>

			<StorePickerDialog
				open={mergePickerOpen}
				onOpenChange={setMergePickerOpen}
				title='Merge Into Another Store'
				description={`Choose the store that keeps “${store.name}”’s receipts. “${store.name}” will be removed.`}
				confirmLabel='Continue'
				allowCreate={false}
				optionVariant='card'
				excludeStoreId={store.id}
				onPick={handlePickStore}
				testId='store-detail-merge-picker'
			/>

			<ConfirmSheet
				open={mergeConfirmOpen}
				onOpenChange={open => !open && !undoableMerge.pending && setMergeConfirmOpen(false)}
				title={mergeTarget ? `Merge “${store.name}” into ${mergeTarget.name}` : 'Merge Stores'}
				description={mergeTarget ? `“${store.name}” will be merged into ${mergeTarget.name}.` : undefined}
				confirmLabel='Merge Stores'
				loadingLabel='Merging…'
				tone='primary'
				loading={undoableMerge.pending}
				onConfirm={handleMerge}
				testId='store-detail-merge-confirm'
			>
				{mergeTarget ? (
					<Alert variant='receipt-info' role='note' data-testid='store-detail-merge-guidance'>
						<HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.8} aria-hidden='true' />
						<AlertTitle>What happens when you merge</AlertTitle>
						<AlertDescription>Receipts, prices and item tags from “{store.name}” move to {mergeTarget.name}, and its name is kept as one of the names on receipts.</AlertDescription>
					</Alert>
				) : null}
			</ConfirmSheet>

			<ConfirmSheet
				open={removing !== null}
				onOpenChange={open => !open && !removePending && setRemoving(null)}
				title={removing ? `Remove “${removing.name}”?` : 'Remove name?'}
				consequence={removing ? 'Receipts that print this name will ask which store they belong to.' : undefined}
				consequenceTone='warning'
				confirmLabel='Remove Name'
				loadingLabel='Removing…'
				tone='danger'
				loading={removePending}
				onConfirm={handleRemove}
				testId='store-name-remove-confirm'
			/>
		</div>
	)
}

function Stat({ icon, tone, value, label, testId, className }: {
	icon: IconSvgElement
	tone: 'success' | 'ocr' | 'primary'
	value: string
	label: string
	testId: string
	className?: string
}) {
	return (
		<Card size='stat' variant='stat' data-testid={testId} className={className}>
			<div className='flex items-center justify-between gap-3'>
				<RowIcon icon={icon} tone={tone} size='stat' testId={`${testId}-icon`} />
				<b className='font-mono text-xl leading-none font-bold tabular-nums'>{value}</b>
			</div>
			<span className='text-xs leading-[1.3] text-muted-foreground'>{label}</span>
		</Card>
	)
}
