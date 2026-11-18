import { Home01Icon } from '@hugeicons/core-free-icons'

import { NotFoundState } from '@/components/app'

// Every address that matches no route lands here, inside the root layout.
export default function NotFound() {
	return <NotFoundState exit={{ href: '/', label: 'Go Home', icon: Home01Icon }} fullScreen testId='root-not-found' />
}
