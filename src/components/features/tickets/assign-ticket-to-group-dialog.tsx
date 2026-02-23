'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { assignTicketToGroup } from '@/lib/api/endpoints/tickets'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/database.types'

type Group = Database['public']['Tables']['groups']['Row']

interface AssignTicketToGroupDialogProps {
	ticketId: string
	groups: Group[]
}

export function AssignTicketToGroupDialog({ ticketId, groups }: AssignTicketToGroupDialogProps) {
	const router = useRouter()
	const [selectedGroupId, setSelectedGroupId] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleAssign = async () => {
		if (!selectedGroupId) {
			toast.error('Please select a group')
			return
		}

		setIsLoading(true)
		const result = await assignTicketToGroup(ticketId, selectedGroupId)
		setIsLoading(false)

		if (result.error) {
			toast.error('Failed to assign group', {
				description: result.error,
			})
			return
		}

		toast.success('Group assigned successfully')
		setOpen(false)
		router.refresh()
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<AlertDialogTrigger asChild>
				<Button
					variant='outline'
					className='border-amber-500 text-amber-600 hover:bg-amber-50'
				>
					Assign to Group
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='truncate font-bold tracking-tight text-foreground'>
						Assign Receipt to Group
					</AlertDialogTitle>
					<AlertDialogDescription>
						This receipt currently has no group assigned. Select a group to organize it properly.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className='space-y-2 py-4'>
					<Label htmlFor='group-select'>Select Group</Label>
					<Select
						value={selectedGroupId}
						onValueChange={setSelectedGroupId}
					>
						<SelectTrigger id='group-select'>
							<SelectValue placeholder='Choose a group…' />
						</SelectTrigger>
						<SelectContent>
							{groups.map(group => (
								<SelectItem
									key={group.id}
									value={group.id}
								>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleAssign}
						disabled={isLoading || !selectedGroupId}
					>
						{isLoading ? 'Assigning…' : 'Assign Group'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
