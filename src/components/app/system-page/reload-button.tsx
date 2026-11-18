'use client'

import { Button } from '@/components/ui/button'

/**
 * Offered by the loading screen after ten seconds. A button, not a link: a link to the same address would need an empty
 * href, which React warns about.
 */
export function ReloadButton({ testId }: { testId: string }) {
	return (
		<Button variant='outline' data-testid={testId} onClick={() => window.location.reload()}>
			Reload
		</Button>
	)
}
