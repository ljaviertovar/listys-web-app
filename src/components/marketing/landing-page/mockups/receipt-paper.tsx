import { TornPaper } from '@/components/commons/torn-paper'

const LINES: [string, string][] = [
	['ORGANIC STRAWBERRIES', '5.99'],
	['ALMND MLK 1L', '4.50'],
	['SRDGH BRD', '5.25'],
	['AVOCADOS (3)', '4.99'],
	['GREEK YOGURT 500G', '6.50'],
	['CHRY TMTO 1KG', '3.75'],
	['BABY SPINACH 200G', '2.40'],
	['EGG FR RNG 12C', '4.80'],
	['PARMESAN 250G', '6.20'],
	['CHK BRST BNL 1KG', '12.30'],
	['OLIVE OIL 750ML', '9.10'],
	['SPARK WATER 6PK', '4.80'],
]

const RULE = 'my-2.5 border-t border-dashed border-paper-line'

/** The paper receipt of the hero, with the scanner beam passing over it: a marketing object, not app UI. */
export function ReceiptPaper() {
	return (
		<TornPaper
			padding='receipt'
			testId='landing-hero-receipt'
		>
			<div className='relative overflow-hidden font-mono text-[11.5px] leading-[1.7] text-paper-text'>
				<span className='receipt-beam' />
				<div className='mb-3 text-center'>
					<div className='font-sans text-[15px] font-bold tracking-[0.06em] text-paper-ink'>MARKET FRESH</div>
					<div className='mt-0.5 text-[11px] text-paper-muted'>123 Green Avenue, CA</div>
					<div className='mt-0.5 text-[11px] text-paper-muted'>05/24/2024 · 14:22</div>
				</div>
				<div className={RULE} />
				<div className='flex justify-between text-[11px] tracking-[0.14em] text-paper-muted uppercase'>
					<span>Item</span>
					<span>Price</span>
				</div>
				<div className={RULE} />
				<div className='flex flex-col gap-[5px]'>
					{LINES.map(([name, price]) => (
						<div
							key={name}
							className='flex justify-between gap-3 tabular-nums'
						>
							<span className='min-w-0 truncate font-sans'>{name}</span>
							<span>{price}</span>
						</div>
					))}
				</div>
				<div className={RULE} />
				<div className='flex justify-between text-[15px] font-semibold tracking-[0.04em] text-paper-ink tabular-nums'>
					<span>TOTAL</span>
					<span>70.58</span>
				</div>
				<div className='mt-3.5 text-center text-[11px] tracking-[0.18em] text-paper-muted'>THANK YOU!</div>
				<div className='receipt-barcode mx-auto mt-2.5 h-[30px] w-[76%] text-paper-ink' />
			</div>
		</TornPaper>
	)
}
