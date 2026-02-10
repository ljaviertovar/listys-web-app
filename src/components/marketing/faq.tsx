'use client'

import { motion } from 'framer-motion'
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
const REVEAL_VIEWPORT = { once: true, amount: 0.22 }
const FADE_UP = {
	hidden: { opacity: 0, y: 16 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: 'easeOut' as const },
	},
} as const

export function Faq() {
	return (
		<motion.section
			className='relative w-full overflow-hidden py-20'
			id='faq'
			initial='hidden'
			whileInView='show'
			viewport={REVEAL_VIEWPORT}
		>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent' />
			<div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
				<motion.div className='text-center mb-12 space-y-4' variants={FADE_UP}>
					<h2 className='font-serif text-3xl font-extrabold tracking-[-0.015em] text-slate-900 md:text-4xl'>
						Frequently Asked Questions
					</h2>
					<p className='text-lg text-slate-700'>Everything you need to know before getting started.</p>
				</motion.div>

				<Accordion
					type='single'
					collapsible
					className='w-full space-y-4 border-none shadow-none rounded-none bg-transparent'
				>
					{faqs.map((faq, index) => (
						<motion.div key={faq.question} variants={FADE_UP} transition={{ delay: index * 0.05 }}>
							<AccordionItem
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
						</motion.div>
					))}
				</Accordion>
			</div>
		</motion.section>
	)
}
