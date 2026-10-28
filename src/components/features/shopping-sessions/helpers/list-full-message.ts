/** What to tell the user when a completed trip left new items out because the base list is full; null when nothing was left out. */
export function listFullMessage(notSaved: number): string | null {
	if (!(notSaved > 0)) return null
	return notSaved === 1
		? '1 new item wasn’t saved to your list because it’s full.'
		: `${notSaved} new items weren’t saved to your list because it’s full.`
}
