'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button, type ButtonProps } from '@/components/ui/button'
import { CreateEntitySheet, type EntityEditValues } from '@/components/commons'
import { createBaseList } from '@/lib/api/endpoints'

/** The trigger is a regular `Button`: `size`, `variant`, `className`… go straight to it. `children` replaces the plus icon and "New Base List" label. */
interface Props extends ButtonProps {
	groupId: string
}

/** "New Base List": the sheet that creates a list inside a group and then opens it to add its items. */
export function CreateBaseListDialog({ groupId, children, ...buttonProps }: Props) {
	const router = useRouter()

	const handleCreate = async ({ name, second }: EntityEditValues) => {
		try {
			const { data: baseList, error } = await createBaseList({
				group_id: groupId,
				name: name.trim(),
				notes: second.trim() ? second.trim() : null,
			})
			if (error) throw new Error(error)
			toast.success('Base list created successfully')

			// Redirect to edit page to add items
			if (baseList?.id) router.push(`/base-lists/${baseList.id}/edit`)
			else router.refresh()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to create base list')
			throw err
		}
	}

	return (
		<CreateEntitySheet
			trigger={
				<Button
					size='primary'
					{...buttonProps}
					data-testid='create-base-list-button'
				>
					{children ?? (
						<>
							<HugeiconsIcon
								icon={PlusSignIcon}
								strokeWidth={1.8}
								data-icon='inline-start'
							/>
							New Base List
						</>
					)}
				</Button>
			}
			title='Create New Base List'
			description='Add a reusable shopping list template.'
			namePlaceholder='e.g. Weekly Groceries, Monthly Supplies'
			secondLabel='Notes'
			secondPlaceholder='Optional notes for this list'
			secondMax={500}
			submitLabel='Create List'
			onCreate={handleCreate}
			testId='create-base-list-sheet'
		/>
	)
}
