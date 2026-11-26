import { TornPaper } from '@/components/commons/torn-paper'
import { MonoLabel, SectionHead, SectionWrapper } from '../commons'

// Only what no section above already answers: the receipts that work, life without receipts, and where the photos go.
const FAQS = [
	{
		question: 'Which receipts work?',
		answer:
			'Printed receipts from any store. Upload one to five photos at a time; a flat, well-lit photo reads best. The store name is read from the receipt itself.',
	},
	{
		question: 'Can I use it without receipts?',
		answer:
			'Yes. Type items into a list and shop from it like any list. Prices, the cheapest store and your spending come only from receipts, so those fill in once you add some.',
	},
	{
		question: 'What happens to my receipt photos?',
		answer:
			'They are kept in private storage tied to your account and opened only through short-lived links. Deleting a receipt deletes its photos.',
	},
]

/** 05 — Questions, printed as a receipt: one numbered line per question, the answer under it. */
export function FaqSection() {
	return (
		<SectionWrapper
			id='faq'
			testId='landing-faq'
		>
			<div className='grid items-start gap-6 md:gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 [&>*]:min-w-0'>
				<div
					data-reveal
					className='lg:sticky lg:top-24'
				>
					<SectionHead
						layout='stack'
						titleSize='faq'
						number='05 — Questions'
						title='Before you create an account'
						description='The things worth knowing before you hand over an email address.'
						testId='landing-faq-head'
					/>
				</div>
				<div data-reveal>
					<TornPaper
						padding='sheet'
						testId='landing-faq-sheet'
					>
						<div className='flex justify-between gap-3 border-b-[1.5px] border-dashed border-paper-line pb-2.5 md:pb-3.5'>
							<MonoLabel>Questions</MonoLabel>
							<MonoLabel>{FAQS.length} items</MonoLabel>
						</div>
						{FAQS.map((faq, index) => (
							<details
								key={faq.question}
								open={index === 0}
								className='group border-b-[1.5px] border-dashed border-paper-line'
							>
								<summary className='focus-ring grid min-h-13 cursor-pointer list-none grid-cols-[30px_minmax(0,1fr)_16px] items-baseline gap-2 rounded-md py-3.5 text-base leading-snug font-bold tracking-[-0.01em] text-paper-ink transition-colors hover:text-primary md:min-h-15 md:grid-cols-[40px_minmax(0,1fr)_20px] md:gap-2.5 md:py-[18px] md:text-[17.5px] [&::-webkit-details-marker]:hidden'>
									<span className='font-mono text-[11px] font-medium tracking-[0.1em] text-paper-muted group-open:text-primary md:text-xs'>
										Q{index + 1}
									</span>
									<span>{faq.question}</span>
									<span
										aria-hidden='true'
										className='relative size-3.5 self-center'
									>
										<span className='absolute inset-x-0 top-1.5 h-0.5 rounded-xs bg-paper-ink' />
										<span className='absolute inset-x-0 top-1.5 h-0.5 rotate-90 rounded-xs bg-paper-ink transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none' />
									</span>
								</summary>
								<p className='max-w-[44em] pr-1 pb-4 pl-[38px] text-[15px] leading-relaxed md:pr-[30px] md:pb-[22px] md:pl-[50px] md:text-base md:leading-[1.65]'>
									{faq.answer}
								</p>
							</details>
						))}
						<div className='flex justify-between pt-3 md:pt-4'>
							<MonoLabel tone='ink'>Answered</MonoLabel>
							<MonoLabel tone='ink'>
								{FAQS.length} / {FAQS.length}
							</MonoLabel>
						</div>
					</TornPaper>
				</div>
			</div>
		</SectionWrapper>
	)
}
