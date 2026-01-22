'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function AuthenticatedError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Authenticated section error:', error)
	}, [error])

	return (
		<div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4'>
			<div className='w-full max-w-md space-y-6 text-center'>
				<div className='flex justify-center'>
					<div className='rounded-full bg-destructive/10 p-4'>
						<AlertCircle className='h-12 w-12 text-destructive' />
					</div>
				</div>

				<div className='space-y-2'>
					<h1 className='text-3xl font-bold tracking-tight'>Error en la aplicación</h1>
					<p className='text-muted-foreground'>
						Ocurrió un problema al procesar tu solicitud. Por favor, intenta nuevamente.
					</p>
				</div>

				{process.env.NODE_ENV === 'development' && error.message && (
					<div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left'>
						<p className='font-mono text-sm text-destructive wrap-break-word'>{error.message}</p>
						{error.digest && <p className='mt-2 font-mono text-xs text-muted-foreground'>Error ID: {error.digest}</p>}
					</div>
				)}

				<div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
					<Button
						onClick={reset}
						variant='default'
						className='gap-2'
					>
						<RefreshCw className='h-4 w-4' />
						Intentar de nuevo
					</Button>
					<Button
						asChild
						variant='outline'
						className='gap-2'
					>
						<Link href='/dashboard'>
							<LayoutDashboard className='h-4 w-4' />
							Ir al dashboard
						</Link>
					</Button>
				</div>

				<p className='text-xs text-muted-foreground'>Si el problema persiste, por favor contacta a soporte.</p>
			</div>
		</div>
	)
}
