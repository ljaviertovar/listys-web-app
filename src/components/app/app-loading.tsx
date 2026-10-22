import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import Logo from '@/components/commons/logo'

export default function AppLoading() {
	return (
		<div className='flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-background'>
			<div className='scale-150'>
				<Logo testId='app-loading-logo' />
			</div>
			<div className='flex animate-pulse items-center gap-2 text-muted-foreground motion-reduce:animate-none'>
				<HugeiconsIcon
					icon={Loading03Icon}
					strokeWidth={2}
					className='h-5 w-5 animate-spin motion-reduce:animate-none'
				/>
				<span className='text-sm font-medium'>Loading...</span>
			</div>
		</div>
	)
}
