import { NotFoundState } from '@/components/app'

// Rendered inside the app shell when a page of the signed-in area calls notFound().
export default function AuthenticatedNotFound() {
	return <NotFoundState exit={{ href: '/dashboard', label: 'Go to Dashboard' }} testId='app-not-found' />
}
