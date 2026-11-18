import { StarIcon } from '@hugeicons/core-free-icons'

import { StatusCard } from '@/components/commons'

import { SetUpPantryAction } from './set-up-pantry-action'

interface SetUpPantryCalloutProps {
	/** The caller names where it is shown (`lists-page-pantry-setup`, `dashboard-pantry-setup`). */
	testId: string
}

/** Offers an account that has no default list the "Set up Pantry" action. The caller decides when to show it. */
export function SetUpPantryCallout({ testId }: SetUpPantryCalloutProps) {
	return (
		<StatusCard
			testId={testId}
			tone='info'
			icon={StarIcon}
			title='Set up your Pantry'
			description='Keep the things you always have at home in one default list.'
			actions={<SetUpPantryAction testId={testId} />}
		/>
	)
}
