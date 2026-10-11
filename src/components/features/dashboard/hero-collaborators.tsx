import { cn } from '@/utils'

// Pastel pairs of design A1: blue, pink, green; the avatar's position picks one so neighbours always differ.
const TONES = ['bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-800', 'bg-green-100 text-green-800']
const MAX_VISIBLE = 3

interface Props {
	collaborators: { initials: string; display_name?: string | null }[]
	caption: string
}

/** The overlapping initials and the "shared with…" line at the foot of the active-session hero (24px circles on the dark photo). */
export function HeroCollaborators({ collaborators, caption }: Props) {
	if (collaborators.length === 0) return null
	const visible = collaborators.slice(0, MAX_VISIBLE)
	const hidden = collaborators.length - visible.length

	return (
		<div
			data-testid='dashboard-hero-collaborators'
			className='flex items-center gap-2.5 font-mono text-xs tracking-[0.04em] text-slate-400'
		>
			<span className='flex'>
				{visible.map((person, index) => (
					<span
						key={index}
						title={person.display_name ?? person.initials}
						className={cn(
							'box-border flex size-6 items-center justify-center rounded-full border-2 border-[#0B1220] font-sans text-[9.5px] font-bold uppercase',
							TONES[index % TONES.length],
							index > 0 && '-ml-[7px]',
						)}
					>
						{person.initials}
					</span>
				))}
				{hidden > 0 ? (
					<span className='-ml-[7px] box-border flex size-6 items-center justify-center rounded-full border-2 border-[#0B1220] bg-slate-700 font-sans text-[9.5px] font-bold text-white'>
						+{hidden}
					</span>
				) : null}
			</span>
			{caption}
		</div>
	)
}
