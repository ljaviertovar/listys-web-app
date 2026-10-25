'use client'

import { useId, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, ListViewIcon } from '@hugeicons/core-free-icons'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDialogFocus } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMergeToBaseList } from './hooks/use-merge-to-base-list'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	ticketId: string
	selectedItemIds: string[]
	onSuccess: (baseListId: string) => void
}

export function MergeToBaseListDialog({ open, onOpenChange, ticketId, selectedItemIds, onSuccess }: Props) {
	const fieldId = useId()
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { onOpenAutoFocus, onCloseAutoFocus } = useDialogFocus(titleRef)
	const {
		mode,
		setMode,
		baseLists,
		listLabels,
		selectedBaseListId,
		setSelectedBaseListId,
		newListName,
		setNewListName,
		loading,
		loadingData,
		loadFailed,
		error,
		setError,
		loadData,
		handleSubmit,
	} = useMergeToBaseList({ open, ticketId, selectedItemIds, onOpenChange, onSuccess })

	const hasLists = baseLists.length > 0

	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => !loading && onOpenChange(isOpen)}
		>
			<DialogContent
				data-testid='merge-to-base-list-dialog'
				onOpenAutoFocus={onOpenAutoFocus}
				onCloseAutoFocus={onCloseAutoFocus}
				sheetOnPhones
				className='sm:max-w-125'
			>
				<DialogHeader>
					<DialogTitle ref={titleRef} tabIndex={-1} variant='sheet'>Add Items to a List</DialogTitle>
					<DialogDescription>
						Add {selectedItemIds.length} selected item{selectedItemIds.length !== 1 ? 's' : ''} to a shopping list.
					</DialogDescription>
				</DialogHeader>

				{loadingData ? (
					<div className='flex items-center justify-center py-8'>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='h-8 w-8 animate-spin text-primary motion-reduce:animate-none'
						/>
					</div>
				) : loadFailed ? (
					<div data-testid='merge-to-base-list-error' className='flex flex-col items-center gap-4 py-8 text-center'>
						<p role='alert' className='text-sm text-destructive'>{error}</p>
						<Button type='button' size='primary' variant='secondary' onClick={loadData}>
							Try Again
						</Button>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						noValidate
						className='space-y-8'
					>
						{hasLists ? (
							<RadioGroup
								value={mode}
								onValueChange={(value: 'existing' | 'new') => {
									setMode(value)
									setError(null)
								}}
							>
								<div className='flex items-center space-x-3'>
									<RadioGroupItem
										value='existing'
										id={`${fieldId}-existing`}
									/>
									<Label htmlFor={`${fieldId}-existing`}>Add to existing list</Label>
								</div>
								<div className='flex items-center space-x-3'>
									<RadioGroupItem
										value='new'
										id={`${fieldId}-new`}
									/>
									<Label htmlFor={`${fieldId}-new`}>Create new list</Label>
								</div>
							</RadioGroup>
						) : (
							<p data-testid='merge-to-base-list-no-lists' className='text-sm text-muted-foreground'>
								You have no lists yet. Name one and these items will start it.
							</p>
						)}

						{mode === 'existing' && hasLists ? (
							<div className='space-y-2'>
								<Label id={`${fieldId}-list-label`} htmlFor={`${fieldId}-list`}>List</Label>
								<Select
									value={selectedBaseListId}
									onValueChange={value => {
										setSelectedBaseListId(value)
										setError(null)
									}}
								>
									<SelectTrigger
										id={`${fieldId}-list`}
										aria-labelledby={`${fieldId}-list-label`}
										aria-required='true'
										aria-invalid={error?.toLowerCase().includes('list') ? true : undefined}
										aria-describedby={error?.toLowerCase().includes('list') ? `${fieldId}-error` : undefined}
										size='lg'
									>
										<SelectValue placeholder='Select a shopping list' />
									</SelectTrigger>
									<SelectContent>
										{baseLists.map(list => (
											<SelectItem
												key={list.id}
												value={list.id}
											>
												<div className='flex items-center gap-2'>
													<HugeiconsIcon
														icon={ListViewIcon}
														strokeWidth={2}
														className='h-4 w-4'
													/>
													{listLabels.get(list.id) ?? list.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className='space-y-2'>
								<Label htmlFor={`${fieldId}-name`}>List Name</Label>
								<Input
									id={`${fieldId}-name`}
									required
									aria-required='true'
									aria-invalid={error?.toLowerCase().includes('name') ? true : undefined}
									aria-describedby={error?.toLowerCase().includes('name') ? `${fieldId}-error` : undefined}
									value={newListName}
									onChange={e => {
										setNewListName(e.target.value)
										if (error?.toLowerCase().includes('name')) setError(null)
									}}
									placeholder='e.g., Weekly Groceries'
								/>
							</div>
						)}

						{error && <p id={`${fieldId}-error`} role='alert' className='text-sm text-destructive'>{error}</p>}

						<div className='w-full flex justify-between gap-4 pt-2'>
							<Button
								type='button'
								variant='secondary'
								size='primary'
								onClick={() => onOpenChange(false)}
								className='flex-1'
							>
								Cancel
							</Button>
							<Button
								type='submit'
								size='primary'
								disabled={loading || (mode === 'existing' ? !selectedBaseListId : !newListName.trim())}
								className='flex-1'
							>
								{loading ? (
									<>
										<HugeiconsIcon
											icon={Loading03Icon}
											strokeWidth={2}
											className='mr-2 h-4 w-4 animate-spin motion-reduce:animate-none'
										/>
										Adding…
									</>
								) : (
									mode === 'new'
										? `Create List with ${selectedItemIds.length} ${selectedItemIds.length === 1 ? 'Item' : 'Items'}`
										: `Add ${selectedItemIds.length} ${selectedItemIds.length === 1 ? 'Item' : 'Items'}`
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
