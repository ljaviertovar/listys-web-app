import { cn } from '@/utils'

export default function AppSidebarFooter({ className }: { className?: string }) {
	return (
		<p className={cn('p-4 text-sm text-muted-foreground', className)}>
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
