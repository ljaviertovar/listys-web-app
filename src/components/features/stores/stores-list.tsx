'use client'

import Link from 'next/link'
import { Edit02Icon, GitMergeIcon, InformationCircleIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { ConfirmSheet, EmptyStateCard, EntityCard, EntityCardSkeleton } from '@/components/commons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Store } from '@/types'

import { buildStoreFacts } from './helpers/store-meta'
import { useStoreActions } from './hooks/use-store-actions'
import { StorePickerDialog } from './store-picker-dialog'
import { StoreRenameCard } from './store-rename-card'

interface StoresListProps {
	stores: Store[]
}

/** "My Stores": the user's stores with how many receipts each has, renamed or merged from each card's menu. */
export function StoresList({ stores }: StoresListProps) {
	const actions = useStoreActions(stores)
	const { flow } = actions
	const visibleStores = stores
		.filter(store => store.id !== actions.hiddenStoreId)
		.map(store => store.id === actions.optimisticMerge?.target.id && stores.some(item => item.id === actions.optimisticMerge?.source.id)
			? { ...store, receipt_count: store.receipt_count + actions.optimisticMerge.source.receipt_count }
			: store)

	if (stores.length === 0) {
		return (
			<EmptyStateCard
				stub={{ label: 'Stores', count: '0 stores' }}
				title='No stores yet'
				description='A store is added when you confirm or save it on a receipt. Open a receipt to start.'
				testId='stores-empty'
			>
				<Button
					asChild
					size='lg'
				>
					<Link href='/tickets'>Go to Receipts</Link>
				</Button>
			</EmptyStateCard>
		)
	}

	return (
		<div
			data-testid='stores-list'
			className='flex flex-col gap-4'
		>
			<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{visibleStores.map(store => flow.kind === 'rename' && flow.store.id === store.id ? (
					<StoreRenameCard
						key={store.id}
						initialName={flow.store.name}
						description={`Receipts printed with “${flow.store.name}” will still be filed under this store.`}
						onCancel={actions.close}
						onSubmit={actions.rename}
						pending={actions.pending}
						error={flow.error}
						action={flow.conflictWith ? (
							<Button
								type='button'
								variant='secondary'
								size='lg'
								onClick={() => flow.conflictWith && actions.chooseTarget(flow.store, flow.conflictWith)}
							>
								Merge Into “{flow.conflictWith.name}”
							</Button>
						) : null}
						testId={`store-rename-card-${store.id}`}
					/>
				) : (
					<EntityCard
						key={store.id}
						title={store.name}
							href={`/stores/${store.id}`}
							linkLabel='View Store'
							badge={
								store.receipt_count === 1 ? (
									<Badge variant='outline'>
										<HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} aria-hidden='true' />
										New
									</Badge>
								) : null
							}
							facts={buildStoreFacts(store)}
						count={store.usual_items_count ?? 0}
						unit={{ one: 'usual item', many: 'usual items' }}
						emptyLabel='usual items'
						menu={{
							label: `More options for ${store.name}`,
							disabled: actions.pending,
							actions: [
								{ label: 'Rename', icon: Edit02Icon, onSelect: () => actions.startRename(store) },
								{
									label: 'Merge Into…',
									icon: GitMergeIcon,
									onSelect: () => actions.startMerge(store),
									disabled: stores.length < 2,
								},
							],
						}}
						testId={`store-card-${store.id}`}
					/>
				))}
			</div>

			<StorePickerDialog
				open={flow.kind === 'pick-target'}
				onOpenChange={open => !open && actions.close()}
				title='Merge Into Another Store'
				description={
					flow.kind === 'pick-target'
						? `Pick the store that will keep the receipts of “${flow.source.name}”. “${flow.source.name}” will be removed.`
						: undefined
				}
				confirmLabel='Continue'
				allowCreate={false}
				searchable={false}
				optionVariant='card'
				excludeStoreId={flow.kind === 'pick-target' ? flow.source.id : null}
				initialSelectedStoreId={flow.kind === 'pick-target' ? stores.find(store => store.id !== flow.source.id)?.id : undefined}
				onPick={pick => flow.kind === 'pick-target' && pick.kind === 'existing' && actions.chooseTarget(flow.source, pick.store)}
				testId='store-merge-picker'
			/>

			<ConfirmSheet
				open={flow.kind === 'confirm-merge'}
				onOpenChange={open => !open && actions.close()}
				title={flow.kind === 'confirm-merge' ? `Merge “${flow.source.name}” into ${flow.target.name}` : 'Merge Stores'}
				description={
					flow.kind === 'confirm-merge'
						? `“${flow.source.name}” will be merged into ${flow.target.name}.`
						: undefined
				}
				confirmLabel='Merge Stores'
				loadingLabel='Merging…'
				tone='primary'
				loading={actions.pending}
				onConfirm={actions.merge}
				testId='store-merge-confirm'
			>
				{flow.kind === 'confirm-merge' ? (
					<>
						<Alert variant='info' role='note' data-testid='store-merge-guidance'>
							<HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.8} aria-hidden='true' />
							<AlertTitle>What happens when you merge</AlertTitle>
							<AlertDescription>Receipts, prices and item tags from “{flow.source.name}” move to {flow.target.name}, and its name is kept as one of the names on receipts.</AlertDescription>
						</Alert>
						{flow.error ? <p role='alert' className='text-sm text-destructive'>{flow.error}</p> : null}
					</>
				) : null}
			</ConfirmSheet>
		</div>
	)
}

/** What My Stores shows while it loads: the count and three card shapes. */
export function StoresSkeleton() {
	return (
		<div
			data-testid='stores-skeleton'
			className='flex flex-col gap-4'
		>
			<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<EntityCardSkeleton
						key={index}
						testId={`store-card-skeleton-${index}`}
						kind='store'
					/>
				))}
			</div>
		</div>
	)
}
