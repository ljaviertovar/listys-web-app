import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
	{
		question: 'Is Listys really free?',
		answer:
			'Yes! We offer a generous free tier that includes 10 groups, unlimited lists, and all core features including AI receipt scanning.',
	},
	{
		question: 'How accurate is the receipt scanning?',
		answer:
			'We use advanced AI (OpenAI Vision) to achieve 99% accuracy. It works with receipts from any store, in any format or layout.',
	},
	{
		question: 'Can I share lists with my family?',
		answer:
			'Absolutely! You can create groups and invite family members or roommates to collaborate on shopping lists in real-time.',
	},
	{
		question: 'Is my data secure?',
		answer:
			'Security is our top priority. All your data is encrypted and stored securely using Supabase. We never sell your personal data.',
	},
]

export function Faq() {
	return (
		<section
			className='relative w-full overflow-hidden py-20'
			id='faq'
		>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-12 space-y-4'>
					<h2 className='font-serif text-3xl font-extrabold tracking-[-0.015em] text-slate-900 md:text-4xl'>
						Frequently Asked Questions
					</h2>
					<p className='text-lg text-slate-700'>Everything you need to know before getting started.</p>
				</div>

				<Accordion
					type='single'
					collapsible
					className='w-full space-y-4 border-none shadow-none rounded-none bg-transparent'
				>
					{faqs.map((faq, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className='bg-white backdrop-blur-md border border-slate-200/50 rounded-xl px-2 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/50 data-[state=open]:shadow-md data-[state=open]:border-primary/20'
						>
							<AccordionTrigger className=' text-lg font-medium text-slate-900 hover:text-primary transition-colors duration-200 hover:no-underline py-5 px-4'>
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className=' text-slate-700 text-base leading-relaxed pb-5 px-4'>
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	)
}
