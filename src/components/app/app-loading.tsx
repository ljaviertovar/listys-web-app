import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import Logo from '@/components/commons/logo'

export default function AppLoading() {
	return (
		<div className='flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-background'>
			<div className='scale-150'>
				<Logo />
			</div>
			<div className='flex items-center gap-2 text-muted-foreground animate-pulse'>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='h-5 w-5 animate-spin'
				/>
				<span className='text-sm font-medium'>Loading...</span>
			</div>
		</div>
	)
}
