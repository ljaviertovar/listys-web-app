import { Pill, ProgressBar, Row, Rows } from '../commons'

export type Device = {
	initials: string
	label: string
	pill: { kind: 'live' | 'collab'; text: string }
	liveBy?: string
	liveAside: string
}

export function DeviceCard({ device }: { device: Device }) {
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
