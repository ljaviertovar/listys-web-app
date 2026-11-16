import { LoadingState } from '@/components/commons'
import Logo from '@/components/commons/logo'

export default function AppLoading() {
	return (
		<LoadingState fullScreen testId='app-loading' label='Loading…' brand={<Logo testId='app-loading-logo' />} />
	)
}
