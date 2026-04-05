'use client'

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface CollaboratorAvatar {
	/** Initials to display (1–2 chars) */
	initials: string
	/** Display name for tooltip / aria-label */
	display_name?: string | null
}

interface Props {
	collaborators: CollaboratorAvatar[]
	/** Maximum number of avatars to show before the +N overflow badge */
	maxVisible?: number
	size?: 'sm' | 'default' | 'lg'
	className?: string
}

export function CollaboratorAvatars({ collaborators, maxVisible = 3, size = 'sm', className }: Props) {
	if (collaborators.length === 0) return null

	const visible = collaborators.slice(0, maxVisible)
	const overflowCount = collaborators.length - visible.length

	return (
		<AvatarGroup className={cn(className)}>
			{visible.map((c, idx) => (
				<Avatar
					key={idx}
					size={size}
					title={c.display_name ?? c.initials}
				>
					<AvatarFallback className='text-[10px] font-bold uppercase'>{c.initials}</AvatarFallback>
				</Avatar>
			))}
			{overflowCount > 0 && <AvatarGroupCount className='text-[10px] font-bold'>+{overflowCount}</AvatarGroupCount>}
		</AvatarGroup>
	)
}
