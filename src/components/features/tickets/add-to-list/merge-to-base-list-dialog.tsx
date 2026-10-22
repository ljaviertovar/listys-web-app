'use client'

import { useId, useRef } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, FolderIcon, ListViewIcon, Folder01Icon } from '@hugeicons/core-free-icons'

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
		groups,
		baseLists,
		selectedGroupId,
		setSelectedGroupId,
		selectedBaseListId,
		setSelectedBaseListId,
		newListName,
		setNewListName,
		loading,
		loadingData,
		error,
		setError,
		loadData,
		handleSubmit,
	} = useMergeToBaseList({ open, ticketId, selectedItemIds, onOpenChange, onSuccess })

	// Filter base lists by selected group
	const filteredBaseLists = baseLists.filter(list => list.group_id === selectedGroupId)

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
				) : error ? (
					<div data-testid='merge-to-base-list-error' className='flex flex-col items-center gap-4 py-8 text-center'>
						<p role='alert' className='text-sm text-destructive'>{error}</p>
						<Button type='button' size='primary' variant='secondary' onClick={loadData}>
							Try Again
						</Button>
					</div>
				) : groups.length === 0 ? (
					<div className='flex flex-col items-center justify-center gap-4 py-8 text-center'>
						<div className='rounded-full bg-muted p-4'>
							<HugeiconsIcon
								icon={Folder01Icon}
								strokeWidth={2}
								className='h-8 w-8 text-muted-foreground'
							/>
						</div>
						<div className='space-y-1'>
							<p className='text-sm font-medium'>No groups found</p>
							<p className='text-sm text-muted-foreground'>Create a group first to organize your shopping lists.</p>
						</div>
						<Button
							asChild
							size='primary'
							className='w-full'
							onClick={() => onOpenChange(false)}
						>
							<Link href='/shopping-lists'>Create Group</Link>
						</Button>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						noValidate
						className='space-y-8'
					>
						{/* Group selector (always shown) */}
						<div className='space-y-2'>
							<Label id={`${fieldId}-group-label`} htmlFor={`${fieldId}-group`}>Group</Label>
							<Select
								value={selectedGroupId}
								onValueChange={value => {
									setSelectedGroupId(value)
									setSelectedBaseListId('')
									setError(null)
								}}
							>
								<SelectTrigger
									id={`${fieldId}-group`}
									aria-labelledby={`${fieldId}-group-label`}
									aria-required='true'
								aria-invalid={error?.toLowerCase().includes('group') ? true : undefined}
									aria-describedby={error?.toLowerCase().includes('group') ? `${fieldId}-error` : undefined}
									size='lg'
								>
									<SelectValue placeholder='Select a group' />
								</SelectTrigger>
								<SelectContent>
									{groups.map(group => (
										<SelectItem
											key={group.id}
											value={group.id}
										>
											<div className='flex items-center gap-2'>
												<HugeiconsIcon
													icon={FolderIcon}
													strokeWidth={2}
													className='h-4 w-4'
												/>
												{group.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<RadioGroup
							value={mode}
							onValueChange={(value: 'existing' | 'new') => setMode(value)}
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

						{mode === 'existing' ? (
							<div className='space-y-2'>
								<Label id={`${fieldId}-list-label`} htmlFor={`${fieldId}-list`}>List</Label>
								{filteredBaseLists.length === 0 ? (
									<p className='text-sm text-muted-foreground'>No lists in this group. Create a new one instead.</p>
								) : (
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
											{filteredBaseLists.map(list => (
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
														{list.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
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
						disabled={loading || (mode === 'existing'
							? !selectedBaseListId
							: !newListName.trim() || !selectedGroupId)}
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
