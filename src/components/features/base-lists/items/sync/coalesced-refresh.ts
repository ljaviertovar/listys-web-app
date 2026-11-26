/** Long enough to take in the realtime events of every row one change touched. */
export const REFRESH_DELAY_MS = 800

/** Turns a burst of reasons to read the page again into one read, made once the burst is over and nothing is busy. */
export function createCoalescedRefresh(isBusy: () => boolean) {
	let timer: ReturnType<typeof setTimeout> | undefined
	return (refresh: () => void) => {
		clearTimeout(timer)
		const run = () => {
			if (isBusy()) timer = setTimeout(run, REFRESH_DELAY_MS)
			else refresh()
		}
		timer = setTimeout(run, REFRESH_DELAY_MS)
	}
}
