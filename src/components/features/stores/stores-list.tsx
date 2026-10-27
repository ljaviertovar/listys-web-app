'use client'

import Link from 'next/link'
import { Edit02Icon, GitMergeIcon, Store01Icon } from '@hugeicons/core-free-icons'

import { ConfirmSheet, EmptyStateCard, EntityCard, EntityCardSkeleton, ListToolbar } from '@/components/commons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Store } from '@/types'

import { useStoreActions } from './hooks/use-store-actions'
import { StoreNameDialog } from './store-name-dialog'
import { StorePickerDialog } from './store-picker-dialog'

interface StoresListProps {
	stores: Store[]
}

const receipts = (count: number) => `${count} ${count === 1 ? 'receipt' : 'receipts'}`

/** "My Stores": the user's stores with how many receipts each has, renamed or merged from each card's menu. */
export function StoresList({ stores }: StoresListProps) {
	const actions = useStoreActions(stores)
	const { flow } = actions

	if (stores.length === 0) {
		return (
			<EmptyStateCard
				icon={Store01Icon}
				title='No stores yet'
				description='A store is added when you confirm or save it on a receipt. Open a receipt to start.'
				testId='stores-empty'
			>
				<Button
					asChild
					size='primary'
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
			<ListToolbar
				count={stores.length}
				unit={{ one: 'store', many: 'stores' }}
				testId='stores-toolbar'
			/>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{stores.map(store => (
					<EntityCard
						key={store.id}
						icon={Store01Icon}
						title={store.name}
						count={store.receipt_count}
						unit={{ one: 'receipt', many: 'receipts' }}
						emptyLabel='receipts'
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

			<StoreNameDialog
				open={flow.kind === 'rename'}
				onOpenChange={open => !open && actions.close()}
				title='Rename Store'
				description={
					flow.kind === 'rename'
						? `Receipts printed with “${flow.store.name}” will still be filed under this store.`
						: undefined
				}
				initialName={flow.kind === 'rename' ? flow.store.name : ''}
				confirmLabel='Save Name'
				onSubmit={actions.rename}
				pending={actions.pending}
				error={flow.kind === 'rename' ? flow.error : null}
				action={
					flow.kind === 'rename' && flow.conflictWith ? (
						<Button
							type='button'
							variant='secondary'
							size='primary'
							onClick={() => flow.conflictWith && actions.chooseTarget(flow.store, flow.conflictWith)}
						>
							Merge Into “{flow.conflictWith.name}”
						</Button>
					) : null
				}
				testId='store-rename-dialog'
			/>

			<StorePickerDialog
				open={flow.kind === 'pick-target'}
				onOpenChange={open => !open && actions.close()}
				title='Merge Into Another Store'
				description={
					flow.kind === 'pick-target'
						? `Choose the store that keeps “${flow.source.name}”’s receipts. “${flow.source.name}” will be removed.`
						: undefined
				}
				confirmLabel='Continue'
				allowCreate={false}
				excludeStoreId={flow.kind === 'pick-target' ? flow.source.id : null}
				onPick={pick => flow.kind === 'pick-target' && pick.kind === 'existing' && actions.chooseTarget(flow.source, pick.store)}
				testId='store-merge-picker'
			/>

			<ConfirmSheet
				open={flow.kind === 'confirm-merge'}
				onOpenChange={open => !open && actions.close()}
				title={flow.kind === 'confirm-merge' ? `Merge “${flow.source.name}” into “${flow.target.name}”?` : 'Merge Stores?'}
				description={
					flow.kind === 'confirm-merge'
						? `${receipts(flow.source.receipt_count)} will move to “${flow.target.name}”, and receipts printed with either name will be filed there.`
						: undefined
				}
				consequence={flow.kind === 'confirm-merge' ? `“${flow.source.name}” will be removed. This can’t be undone.` : undefined}
				confirmLabel='Merge Stores'
				loadingLabel='Merging…'
				tone='danger'
				loading={actions.pending}
				onConfirm={actions.merge}
				testId='store-merge-confirm'
			>
				{flow.kind === 'confirm-merge' && flow.error ? (
					<p
						role='alert'
						className='text-sm text-destructive'
					>
						{flow.error}
					</p>
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
			<div className='flex min-h-11 items-center'>
				<Skeleton className='h-3.5 w-16 rounded-md' />
			</div>
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3'>
				{[0, 1, 2].map(index => (
					<EntityCardSkeleton
						key={index}
						testId={`store-card-skeleton-${index}`}
					/>
				))}
			</div>
		</div>
	)
}
