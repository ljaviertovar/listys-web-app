'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Root error boundary:', error)
	}, [error])

	return (
		<html lang='en'>
			<body>
				<div className='flex min-h-screen items-center justify-center bg-background px-4'>
					<div className='w-full max-w-md space-y-6 text-center'>
						<div className='flex justify-center'>
							<div className='rounded-full bg-destructive/10 p-4'>
								<AlertCircle className='h-12 w-12 text-destructive' />
							</div>
						</div>

						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tight'>Algo salió mal</h1>
							<p className='text-muted-foreground'>
								Lo sentimos, ocurrió un error inesperado. Por favor, intenta de nuevo.
							</p>
						</div>

						{process.env.NODE_ENV === 'development' && error.message && (
							<div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left'>
								<p className='font-mono text-sm text-destructive'>{error.message}</p>
								{error.digest && (
									<p className='mt-2 font-mono text-xs text-muted-foreground'>Error ID: {error.digest}</p>
								)}
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
								<Link href='/'>
									<Home className='h-4 w-4' />
									Ir al inicio
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</body>
		</html>
	)
}
