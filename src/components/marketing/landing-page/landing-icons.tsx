import Link from 'next/link'

import { LogoMark } from '@/components/commons/logo'

export type LandingIconId =
	| 'tick'
	| 'arr'
	| 'ic-signal'
	| 'ic-wifi'
	| 'ic-batt'
	| 'ic-scan'
	| 'chev'
	| 'spark'
	| 'i-list'
	| 'i-folders'

/** Rendered once per page; every <Icon> references a symbol from here. */
export function LandingSprite() {
	return (
		<svg
			width='0'
			height='0'
			style={{ position: 'absolute' }}
			aria-hidden='true'
			focusable='false'
		>
			<defs>
				<symbol
					id='lp-tick'
					viewBox='0 0 16 16'
				>
					<path
						d='M3.2 8.4l3.1 3.1 6.5-7'
						fill='none'
						stroke='currentColor'
						strokeWidth='2.6'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</symbol>
				<symbol
					id='lp-arr'
					viewBox='0 0 16 16'
				>
					<path
						d='M3 8h9.4M8.6 4l4 4-4 4'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.9'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</symbol>
				<symbol
					id='lp-ic-signal'
					viewBox='0 0 18 12'
				>
					<rect
						x='0'
						y='8'
						width='3'
						height='4'
						rx='1'
						fill='currentColor'
					/>
					<rect
						x='5'
						y='5.5'
						width='3'
						height='6.5'
						rx='1'
						fill='currentColor'
					/>
					<rect
						x='10'
						y='3'
						width='3'
						height='9'
						rx='1'
						fill='currentColor'
					/>
					<rect
						x='15'
						y='0'
						width='3'
						height='12'
						rx='1'
						fill='currentColor'
					/>
				</symbol>
				<symbol
					id='lp-ic-wifi'
					viewBox='0 0 16 12'
				>
					<path
						d='M1 3.6a11 11 0 0 1 14 0M3.6 6.6a7 7 0 0 1 8.8 0M6.2 9.4a3 3 0 0 1 3.6 0'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.6'
						strokeLinecap='round'
					/>
					<circle
						cx='8'
						cy='11.2'
						r='1'
						fill='currentColor'
					/>
				</symbol>
				<symbol
					id='lp-ic-batt'
					viewBox='0 0 26 12'
				>
					<rect
						x='0.7'
						y='0.7'
						width='21'
						height='10.6'
						rx='3'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.3'
						opacity='.45'
					/>
					<rect
						x='2.4'
						y='2.4'
						width='17.6'
						height='7.2'
						rx='1.8'
						fill='currentColor'
					/>
					<path
						d='M23.6 4.3v3.4a2.2 2.2 0 0 0 0-3.4Z'
						fill='currentColor'
						opacity='.45'
					/>
				</symbol>
				<symbol
					id='lp-ic-scan'
					viewBox='0 0 24 24'
				>
					<path
						d='M4 8.6V6.4A2.4 2.4 0 0 1 6.4 4h2.2M15.4 4h2.2A2.4 2.4 0 0 1 20 6.4v2.2M20 15.4v2.2a2.4 2.4 0 0 1-2.4 2.4h-2.2M8.6 20H6.4A2.4 2.4 0 0 1 4 17.6v-2.2'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
						strokeLinecap='round'
					/>
					<circle
						cx='12'
						cy='12'
						r='3.1'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
					/>
				</symbol>
				<symbol
					id='lp-chev'
					viewBox='0 0 16 16'
				>
					<path
						d='M4 6.2l4 4 4-4'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.9'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</symbol>
				<symbol
					id='lp-spark'
					viewBox='0 0 24 24'
				>
					<path
						d='M12 3.1l1.95 5.05L19 10.1l-5.05 1.95L12 17.1l-1.95-5.05L5 10.1l5.05-1.95Z'
						fill='currentColor'
					/>
					<path
						d='M18.4 14.9l.75 1.95 1.95.75-1.95.75-.75 1.95-.75-1.95-1.95-.75 1.95-.75Z'
						fill='currentColor'
					/>
				</symbol>
				<symbol
					id='lp-i-list'
					viewBox='0 0 24 24'
				>
					<path
						d='M3.6 7.4l1.6 1.6 2.8-3M3.6 15.9l1.6 1.6 2.8-3'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M11.4 7.6h9M11.4 16.1h9'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
						strokeLinecap='round'
					/>
				</symbol>
				<symbol
					id='lp-i-folders'
					viewBox='0 0 24 24'
				>
					<path
						d='M7.4 7.2V5.9A1.7 1.7 0 0 1 9.1 4.2h2.7l1.5 1.9h3.4a1.7 1.7 0 0 1 1.7 1.7v1'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M3.6 10.1a1.9 1.9 0 0 1 1.9-1.9h3l1.6 2.1h6.4a1.9 1.9 0 0 1 1.9 1.9v5.7a1.9 1.9 0 0 1-1.9 1.9H5.5a1.9 1.9 0 0 1-1.9-1.9Z'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.7'
						strokeLinejoin='round'
					/>
				</symbol>
			</defs>
		</svg>
	)
}

export function Icon({ id, className }: { id: LandingIconId; className?: string }) {
	return (
		<svg
			className={className}
			aria-hidden='true'
		>
			<use href={`#lp-${id}`} />
		</svg>
	)
}

export function Brand() {
	return (
		<Link
			className='flex items-center gap-[9px] text-[18px] font-extrabold tracking-[-0.03em] text-slate-900 [&_svg]:size-6 [&_svg]:shrink-0'
			href='/'
		>
			<LogoMark />
			Listys
		</Link>
	)
}
