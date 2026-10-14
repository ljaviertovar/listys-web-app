import { cn } from '@/utils'

export default function AppSidebarFooter({ className }: { className?: string }) {
	return (
		<p className={cn('px-2 pt-1 pb-1.5 text-xs text-slate-500', className)}>
			Develop by{' '}
			<a
				href='https://www.ljaviertovar.dev/'
				target='_blank'
				rel='noopener noreferrer'
				className='-my-3 inline-block py-3 text-primary font-medium underline'
			>
				L Javier Tovar
			</a>
		</p>
	)
}
