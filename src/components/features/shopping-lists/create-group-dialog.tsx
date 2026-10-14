'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { CreateEntitySheet, type EntityEditValues } from '@/components/commons'
import { createGroup } from '@/lib/api/endpoints'

/** The trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. `children` replaces the plus icon and "New Group" label. */
type Props = ButtonProps

/** "New Group": the sheet that creates a group of shopping lists. */
export function CreateGroupDialog({ children, ...buttonProps }: Props = {}) {
	const router = useRouter()

	const handleCreate = async ({ name, second }: EntityEditValues) => {
		try {
			const { error } = await createGroup({ name: name.trim(), description: second.trim() || undefined })
			if (error) throw new Error(error)
			toast.success('Group created successfully')
			router.refresh()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to create group')
			throw err
		}
	}

	return (
		<CreateEntitySheet
			trigger={
				<Button
					{...buttonProps}
					data-testid='create-group-button'
				>
					{children ?? (
						<>
							<HugeiconsIcon
								icon={PlusSignIcon}
								strokeWidth={1.8}
								data-icon='inline-start'
							/>
							New Group
						</>
					)}
				</Button>
			}
			title='Create New Group'
			description='Add a new group to organize your shopping lists.'
			namePlaceholder='e.g. Groceries, Household'
			secondLabel='Description'
			secondPlaceholder='Add a description for this group'
			secondMax={500}
			submitLabel='Create Group'
			onCreate={handleCreate}
			testId='create-group-sheet'
		/>
	)
}
