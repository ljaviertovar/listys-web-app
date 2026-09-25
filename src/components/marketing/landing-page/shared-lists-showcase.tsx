import Image from 'next/image'

import { Icon } from './landing-icons'
import { Avatars, Pill, ProgressBar, Row, Rows } from './list-rows'
import { Shell } from './shell'

const POINTS = [
	'A check lands for everyone the moment it happens, mid-aisle',
	'One shared source of truth, so nobody comes home with two of anything',
	'Every item shows who added it and who picked it up',
]

const FEED = [
	{ initials: 'NH', who: 'Noah', what: 'checked off almond milk', when: 'just now' },
	{ initials: 'AV', who: 'Ava', what: 'added lemons · 4 unit', when: '2 min ago' },
	{ initials: 'MY', who: 'Maya', what: 'checked off greek yogurt', when: '6 min ago' },
]

type Device = {
	initials: string
	label: string
	pill: { kind: 'live' | 'collab'; text: string }
	liveBy?: string
	liveAside: string
}

const DEVICES: Device[] = [
	{ initials: 'NO', label: 'Noah · in the aisle', pill: { kind: 'live', text: 'Shopping' }, liveBy: 'Noah', liveAside: 'tapped' },
	{ initials: 'MA', label: 'Maya · at home', pill: { kind: 'collab', text: 'Noah is shopping' }, liveAside: 'Noah · now' },
]

function DeviceCard({ device }: { device: Device }) {
	return (
		<div className='flex flex-col gap-[11px]'>
			<div className='flex items-center gap-[9px] font-mono text-[11px] tracking-[.09em] text-slate-500 uppercase'>
				<span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[8px] font-semibold text-white'>
					{device.initials}
				</span>
				{device.label}
			</div>
			<div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
				<div className='border-b border-slate-200 px-[15px] pt-[13px] pb-[14px]'>
					<div className='flex items-start justify-between gap-[10px]'>
						<div>
							<div className='text-[13px] font-extrabold tracking-[-0.02em] text-slate-900'>Weekly household</div>
							<div className='mt-1 font-mono text-[11px] text-slate-500'>4 of 9 items checked</div>
						</div>
						<Pill kind={device.pill.kind}>{device.pill.text}</Pill>
					</div>
					<ProgressBar
						value={44}
						className='mt-[10px]'
						barClassName='bg-violet-600'
					/>
				</div>
				<div className='flex flex-col gap-2 p-3'>
					<Rows>
						<Row
							chip='1 box'
							name='organic strawberries'
							by='Maya'
							checked
							done
						/>
						<Row
							chip='3 unit'
							name='avocados'
							by='Noah'
							checked
							done
						/>
						<Row
							chip='1 L'
							name='almond milk'
							by={device.liveBy}
							checked
							done
							live
							aside={
								<span className='shrink-0 font-mono text-[10px] tracking-[.07em] whitespace-nowrap text-violet-600 uppercase'>
									{device.liveAside}
								</span>
							}
						/>
						<Row
							chip='1 kg'
							name='tomatoes'
							by='Maya'
							checked={false}
						/>
					</Rows>
				</div>
			</div>
		</div>
	)
}

/** The photo carries the section headline; the mockups below prove the claim it makes. */
function SharedListsBanner() {
	return (
		<div
			data-testid='shared-lists-banner'
			className='relative h-[210px] overflow-hidden rounded-2xl min-[900px]:h-[300px] min-[900px]:rounded-[20px]'
		>
			<Image
				src='/images/landing/shared-lists.webp'
				alt='Two shoppers, one at a kitchen counter and one in a grocery aisle, both looking at their phones.'
				fill
				sizes='(min-width: 1200px) 1136px, calc(100vw - 40px)'
				className='object-cover object-[center_28%]'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 bg-[linear-gradient(0deg,rgba(15,23,42,.82)_0%,rgba(15,23,42,.2)_60%,transparent_80%)] min-[900px]:bg-[linear-gradient(0deg,rgba(15,23,42,.78)_0%,rgba(15,23,42,.15)_55%,transparent_75%)]'
			/>
			<div className='absolute inset-x-[18px] bottom-4 min-[900px]:inset-x-8 min-[900px]:bottom-[26px]'>
				<span className='font-mono text-[10px] tracking-[.12em] text-violet-300 uppercase min-[900px]:text-[11px]'>
					Shared lists
				</span>
				<h2 className='mt-[5px] text-[22px] leading-[1.12] font-extrabold tracking-[-0.03em] text-white text-balance min-[900px]:mt-1.5 min-[900px]:text-[clamp(28px,3vw,32px)] min-[900px]:leading-[1.1]'>
					Two of you, one list, in real time.
				</h2>
				<p className='mt-1.5 max-w-[46em] text-[12.5px] leading-[1.5] text-slate-200 min-[900px]:mt-2 min-[900px]:text-[14.5px] min-[900px]:leading-[1.55]'>
					{/* Shorter copy on narrow screens so the text never covers the faces in the photo. */}
					<span className='min-[640px]:hidden'>
						Noah is in the aisle. Maya is at home — the check lands for her the moment he taps it.
					</span>
					<span className='hidden min-[640px]:inline'>
						Noah is in the aisle. Maya is at home. The moment he ticks something off, it is ticked for her — and for
						anyone else on the list.
					</span>
				</p>
			</div>
		</div>
	)
}

export function SharedListsShowcase() {
	return (
		<section
			id='shared-lists'
			data-testid='landing-shared-lists'
			className='section-divider scroll-mt-16 bg-white py-[72px] min-[900px]:py-[104px]'
		>
			<Shell>
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
			</Shell>
		</section>
	)
}
