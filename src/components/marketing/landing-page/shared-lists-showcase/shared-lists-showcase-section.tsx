import { Avatars, Icon } from '../commons'
import { DeviceCard, type Device } from './device-card'
import { SharedListsBanner } from './shared-lists-banner'

const POINTS = [
	'A check lands for everyone the moment it happens, mid-aisle',
	'One shared source of truth, so nobody comes home with two of anything',
	'Every item shows who added it and who picked it up',
]

const FEED = [
	{
		initials: 'NH',
		who: 'Noah',
		what: 'checked off almond milk',
		when: 'just now',
	},
	{
		initials: 'AV',
		who: 'Ava',
		what: 'added lemons · 4 unit',
		when: '2 min ago',
	},
	{
		initials: 'MY',
		who: 'Maya',
		what: 'checked off greek yogurt',
		when: '6 min ago',
	},
]

const DEVICES: Device[] = [
	{
		initials: 'NO',
		label: 'Noah · in the aisle',
		pill: { kind: 'live', text: 'Shopping' },
		liveBy: 'Noah',
		liveAside: 'tapped',
	},
	{
		initials: 'MA',
		label: 'Maya · at home',
		pill: { kind: 'collab', text: 'Noah is shopping' },
		liveAside: 'Noah · now',
	},
]

export function SharedListsShowcaseSection() {
	return (
		<div
			data-testid='landing-shared-lists'
			className='w-full'
		>
			<SharedListsBanner />

			<div className='mt-5 grid gap-6 min-[900px]:mt-8 min-[900px]:gap-8 min-[1040px]:grid-cols-[minmax(0,300px)_minmax(0,1fr)] min-[1040px]:items-center min-[1040px]:gap-14'>
				<div>
					<div className='flex flex-col gap-[10px] min-[900px]:gap-[14px]'>
						{POINTS.map(point => (
							<div
								key={point}
								className='flex items-start gap-[9px] text-[13.5px] leading-[1.45] text-slate-700 min-[900px]:gap-3 min-[900px]:text-[15px] min-[900px]:leading-[1.55]'
							>
								<i className='mt-[2px] flex size-[21px] shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 [&_svg]:size-3'>
									<Icon id='tick' />
								</i>
								<span>{point}</span>
							</div>
						))}
					</div>
					<div className='mt-4 flex items-center gap-[9px] text-[12.5px] text-slate-600 min-[900px]:mt-[26px] min-[900px]:gap-3 min-[900px]:text-sm'>
						<Avatars initials={['MY', 'NH', 'AV']} />
						<span>Maya, Noah and Ava share this list</span>
					</div>
				</div>

				<div>
					<div className='grid items-start gap-[18px] min-[700px]:grid-cols-[1fr_112px_1fr] min-[700px]:gap-0'>
						<DeviceCard device={DEVICES[0]} />
						<div className='dashed-link relative flex items-center justify-center py-[10px] min-[700px]:self-center min-[700px]:py-0'>
							<span className='relative z-[2] flex items-center gap-[7px] rounded-full border border-violet-600/[0.35] bg-violet-50 px-[13px] py-[7px] font-mono text-[11px] tracking-[.1em] whitespace-nowrap text-violet-600 uppercase'>
								<i className='block size-[5px] rounded-full bg-violet-600' />
								Synced
							</span>
						</div>
						<DeviceCard device={DEVICES[1]} />
					</div>

					<div
						aria-label='Recent list activity'
						data-testid='activity-toast-stack'
						role='list'
						className='mx-auto mt-[18px] grid w-fit max-w-full gap-2'
					>
						{FEED.map(entry => (
							<div
								key={entry.who}
								data-testid={`activity-toast-${entry.initials.toLowerCase()}`}
								role='listitem'
								className='flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-[10px] text-[13px] text-slate-700 shadow-sm'
							>
								<span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-600 font-mono text-[8.5px] font-semibold text-white'>
									{entry.initials}
								</span>
								<span className='min-w-0 flex-1 truncate'>
									<b className='font-bold text-slate-900'>{entry.who}</b> {entry.what}
								</span>
								<span className='font-mono text-[11px] whitespace-nowrap text-slate-500'>{entry.when}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
