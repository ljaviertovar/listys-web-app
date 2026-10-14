'use client'

import type { ComponentProps, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { A1_TOOLBAR_BUTTON } from '@/components/app/helpers/a1-surface'
import { CreateEntitySheet, type EntityEditValues } from '@/components/commons'
import { createGroup } from '@/lib/api/endpoints'
import { cn } from '@/utils'

interface Props {
	/** Lets a surface that already has a primary action demote this trigger to a secondary one. */
	variant?: ComponentProps<typeof Button>['variant']
	className?: string
	/** Replaces the default plus icon and "New Group" label inside the trigger button. */
	children?: ReactNode
}

/** "New Group": the sheet that creates a group of shopping lists. */
export function CreateGroupDialog({ variant, className, children }: Props = {}) {
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
					size={'lg'}
					variant={variant}
					className={cn(A1_TOOLBAR_BUTTON, className)}
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
