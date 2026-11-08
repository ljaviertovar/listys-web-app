'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'

interface CategoryCollapseControlProps {
	allCollapsed: boolean
	onToggle: () => void
	testId: string
}

export function CategoryCollapseControl({ allCollapsed, onToggle, testId }: CategoryCollapseControlProps) {
	return (
		<Button type='button' variant='ghost-primary' size='touch' onClick={onToggle} data-testid={testId}>
			<HugeiconsIcon
				icon={allCollapsed ? ArrowDown01Icon : ArrowUp01Icon}
				strokeWidth={1.8}
				aria-hidden='true'
			/>
			{allCollapsed ? 'Expand All' : 'Collapse All'}
		</Button>
	)
}
