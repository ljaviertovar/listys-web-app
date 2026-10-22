/**
 * Query flag of the one visit that follows starting a shopping session. The page reads it to open with its categories folded,
 * and the items clear it once shown, so a reload or a later visit finds them open again. It lives in the URL, not in storage,
 * so the server and the first client render agree.
 */
export const STARTED_SESSION_PARAM = 'started'

/** Where to send the user right after a session is created. */
export function startedSessionHref(sessionId: string) {
	return `/shopping/${sessionId}?${STARTED_SESSION_PARAM}=1`
}
