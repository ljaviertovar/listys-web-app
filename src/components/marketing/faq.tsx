'use client'

import { motion } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
	{
		question: 'Is Listys really free?',
		answer:
			'Yes. You can start with a free plan that includes the core features, including receipt scanning and shared lists.',
	},
	{
		question: 'How accurate is the receipt scanning?',
		answer:
			'Listys is built for high accuracy across different receipt formats. You can quickly review and edit items before shopping.',
	},
	{
		question: 'Can I share lists with my family?',
		answer:
			'Yes. Create a shared group and collaborate with family members or roommates in real time.',
	},
	{
		question: 'Is my data secure?',
		answer:
			'Yes. Your data is stored securely, and we do not sell your personal information.',
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
					<p className='text-lg text-slate-700'>Quick answers before you create your account.</p>
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
