export const TRIP_REVIEW_COPY = {
	intro: (list: string) => `Each receipt line updates this trip and your ${list} list. Nothing changes until you attach.`,
	sections: {
		new: { title: (list: string) => `New to ${list}`, help: (list: string) => `Bought but not on your list. They’re added to this trip and to ${list}.` },
		'will-be-checked': { title: () => 'Will be checked off', help: () => 'On this trip but not checked. They’re checked off with the receipt price.' },
		'already-checked': { title: () => 'Already checked', help: () => 'You checked these during the trip. They only get the receipt price.' },
		'left-out': { title: () => 'Left out', help: (list: string) => `Not saved to the trip or to ${list}.` },
		'checked-not-on-receipt': { title: () => 'Checked, not on the receipt', help: () => 'These stay as bought, without a price.' },
		'not-checked-not-on-receipt': { title: () => 'Not checked, not on the receipt', help: (list: string) => `Not bought. They stay on ${list} for your next trip.` },
	},
	choices: {
		add: (list: string) => `Adds it to this trip and to ${list}.`,
		match: () => 'Checks off that item. This name is remembered next time.',
		leave: (list: string) => `Not saved to the trip or to ${list}.`,
	},
}
