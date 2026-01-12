import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Listys - Smart Shopping List Manager',
	description: 'Manage your shopping lists with AI-powered receipt processing',
}

export default async function Home() {
	const supabase = await createClient()
	const { data } = await supabase.auth.getClaims()

	const user = data?.claims

	if (user) {
		redirect('/dashboard')
	}

	return (
		<>
			<section className='mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20  h-screen'>
				<h1 className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-7xl lg:leading-[1.1]'>
					Listys
				</h1>
				<span
					className='max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl'
					style={{ display: 'inline-block', verticalAlign: 'top', textDecoration: 'inherit' }}
				>
					Your smart shopping list manager with AI-powered receipt processing
				</span>

				<div className='container mx-auto max-w-7xl mt-20'>
					<div className='mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl'>
						<div className='rounded-lg bg-white p-6 shadow-md'>
							<div className='mb-4 text-4xl'>📋</div>
							<h3 className='text-lg font-semibold text-gray-900'>Base Lists</h3>
							<p className='mt-2 text-sm text-gray-600'>
								Create reusable shopping templates organized by store or category
							</p>
						</div>
						<div className='rounded-lg bg-white p-6 shadow-md'>
							<div className='mb-4 text-4xl'>📸</div>
							<h3 className='text-lg font-semibold text-gray-900'>OCR Processing</h3>
							<p className='mt-2 text-sm text-gray-600'>Extract items from receipt photos using AI</p>
						</div>
						<div className='rounded-lg bg-white p-6 shadow-md'>
							<div className='mb-4 text-4xl'>🛒</div>
							<h3 className='text-lg font-semibold text-gray-900'>Shopping Runs</h3>
							<p className='mt-2 text-sm text-gray-600'>Interactive checklists with progress tracking</p>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
