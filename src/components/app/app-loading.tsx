import { ReceiptPaper, ReloadButton, SystemPage } from './system-page'

/**
 * What shows when the app opens or the server is slow to answer: the receipt paper feeding under the wordmark. It never
 * counts or promises an end; after ten seconds it adds one line and a way out, all in CSS so it works before hydration.
 */
export default function AppLoading() {
	return (
		<SystemPage
			testId='app-loading'
			fullScreen
			role='status'
			aria-live='polite'
			aria-busy='true'
			aria-label='Loading…'
			contentClassName='animate-system-reveal'
			paper={<ReceiptPaper variant='feed' testId='app-loading-paper' />}
		>
			<div className='relative mt-2.5 w-full'>
				<p className='text-sm font-medium text-muted-foreground'>Loading…</p>
				{/* Out of the flow, so the hidden line and button take no room before the ten seconds are up. */}
				<div data-testid='app-loading-slow' className='absolute inset-x-0 top-full mt-1 flex flex-col items-center gap-3 animate-system-slow'>
					<p className='text-xs text-muted-foreground'>This is taking longer than usual.</p>
					<ReloadButton testId='app-loading-reload' />
				</div>
			</div>
		</SystemPage>
	)
}
