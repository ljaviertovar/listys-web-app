'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon, FolderIcon, Add01Icon } from '@hugeicons/core-free-icons'
import { getGroups } from '@/actions/shopping-lists'
import { getBaseLists } from '@/actions/base-lists'
import { mergeTicketItemsToBaseList, createBaseListFromTicket } from '@/actions/tickets'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	ticketId: string
	selectedItemIds: string[]
	onSuccess: () => void
}

type Group = { id: string; name: string }
type BaseList = { id: string; name: string; group_id: string }

export function MergeToBaseListDialog({ open, onOpenChange, ticketId, selectedItemIds, onSuccess }: Props) {
	const [mode, setMode] = useState<'existing' | 'new'>('existing')
	const [groups, setGroups] = useState<Group[]>([])
	const [baseLists, setBaseLists] = useState<BaseList[]>([])
	const [selectedGroupId, setSelectedGroupId] = useState<string>('')
	const [selectedBaseListId, setSelectedBaseListId] = useState<string>('')
	const [newListName, setNewListName] = useState('')
	const [loading, setLoading] = useState(false)
	const [loadingData, setLoadingData] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	// Load groups and base lists
	useEffect(() => {
		if (open) {
			loadData()
		}
	}, [open])

	const loadData = async () => {
		setLoadingData(true)
		try {
			const [groupsResult, baseListsResult] = await Promise.all([getGroups(), getBaseLists()])

			if (groupsResult.data) {
				setGroups(groupsResult.data)
				if (groupsResult.data.length > 0 && !selectedGroupId) {
					setSelectedGroupId(groupsResult.data[0].id)
				}
			}

			if (baseListsResult.data) {
				setBaseLists(baseListsResult.data)
			}
		} catch (err) {
			setError('Failed to load data')
		} finally {
			setLoadingData(false)
		}
	}

	// Filter base lists by selected group
	const filteredBaseLists = baseLists.filter(list => list.group_id === selectedGroupId)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			if (mode === 'existing') {
				if (!selectedBaseListId) {
					setError('Please select a list')
					setLoading(false)
					return
				}

				const result = await mergeTicketItemsToBaseList({
					ticket_id: ticketId,
					base_list_id: selectedBaseListId,
					items: selectedItemIds.map(id => ({ id, merge: true })),
				})

				if (result.error) {
					setError(result.error)
					return
				}
			} else {
				if (!newListName.trim()) {
					setError('Please enter a list name')
					setLoading(false)
					return
				}

				if (!selectedGroupId) {
					setError('Please select a group')
					setLoading(false)
					return
				}

				const result = await createBaseListFromTicket({
					ticket_id: ticketId,
					group_id: selectedGroupId,
					name: newListName.trim(),
					item_ids: selectedItemIds,
				})

				if (result.error) {
					setError(result.error)
					return
				}
			}

			onSuccess()
		} catch (err: any) {
			setError(err.message || 'Failed to add items')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => !loading && onOpenChange(isOpen)}
		>
			<DialogContent className='sm:max-w-125'>
				<DialogHeader>
					<DialogTitle>Add Items to List</DialogTitle>
					<DialogDescription>
						Add {selectedItemIds.length} selected item{selectedItemIds.length !== 1 ? 's' : ''} to a shopping list.
					</DialogDescription>
				</DialogHeader>

				{loadingData ? (
					<div className='flex items-center justify-center py-8'>
						<HugeiconsIcon
							icon={Loading03Icon}
							strokeWidth={2}
							className='h-8 w-8 animate-spin text-primary'
						/>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						className='space-y-4'
					>
						<RadioGroup
							value={mode}
							onValueChange={(value: 'existing' | 'new') => setMode(value)}
							className='space-y-3'
						>
							<div className='flex items-center space-x-3'>
								<RadioGroupItem
									value='existing'
									id='existing'
								/>
								<Label htmlFor='existing'>Add to existing list</Label>
							</div>
							<div className='flex items-center space-x-3'>
								<RadioGroupItem
									value='new'
									id='new'
								/>
								<Label htmlFor='new'>Create new list</Label>
							</div>
						</RadioGroup>

						{/* Group selector (always shown) */}
						<div className='space-y-2'>
							<Label>Group</Label>
							<Select
								value={selectedGroupId}
								onValueChange={value => {
									setSelectedGroupId(value)
									setSelectedBaseListId('')
								}}
							>
								<SelectTrigger>
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

						{mode === 'existing' ? (
							<div className='space-y-2'>
								<Label>Select List</Label>
								{filteredBaseLists.length === 0 ? (
									<p className='text-sm text-muted-foreground'>No lists in this group. Create a new one instead.</p>
								) : (
									<Select
										value={selectedBaseListId}
										onValueChange={setSelectedBaseListId}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select a list' />
										</SelectTrigger>
										<SelectContent>
											{filteredBaseLists.map(list => (
												<SelectItem
													key={list.id}
													value={list.id}
												>
													{list.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						) : (
							<div className='space-y-2'>
								<Label htmlFor='newListName'>List Name</Label>
								<Input
									id='newListName'
									value={newListName}
									onChange={e => setNewListName(e.target.value)}
									placeholder='e.g., Weekly Groceries'
								/>
							</div>
						)}

						{error && <p className='text-sm text-destructive'>{error}</p>}

						<div className='flex justify-end gap-2 pt-2'>
							<Button
								type='button'
								variant='outline'
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={loading}
							>
								{loading ? (
									<>
										<HugeiconsIcon
											icon={Loading03Icon}
											strokeWidth={2}
											className='mr-2 h-4 w-4 animate-spin'
										/>
										Adding...
									</>
								) : (
									<>
										<HugeiconsIcon
											icon={Add01Icon}
											strokeWidth={2}
											className='mr-2 h-4 w-4'
										/>
										Add to List
									</>
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
