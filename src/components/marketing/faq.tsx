import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

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
		<section className='w-full py-20 bg-slate-50/20 backdrop-blur-sm' id="faq">
			<div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-12 space-y-4'>
					<h2 className='text-3xl md:text-4xl font-bold text-slate-900'>
						Frequently Asked Questions
					</h2>
					<p className='text-lg text-slate-600'>
						Everything you need to know about Listys.
					</p>
				</div>

				<Accordion type='single' collapsible className='w-full space-y-4 border-none shadow-none rounded-none bg-transparent'>
					{faqs.map((faq, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className='bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-xl px-2 shadow-sm transition-all hover:shadow-md'
						>
							<AccordionTrigger className='text-lg font-medium text-slate-900 hover:text-primary transition-colors hover:no-underline py-5 px-4'>
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className='text-slate-600 text-base leading-relaxed pb-5 px-4'>
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	)
}
