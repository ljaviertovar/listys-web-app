/** Turns a Supabase auth error into a sentence that says what to repair; unknown messages pass through unchanged. */
export function describeAuthError(message: string | undefined, fallback: string): string {
	if (!message) return fallback
	if (/invalid login credentials/i.test(message)) {
		return 'Invalid login credentials. Check your email and password, then try again.'
	}
	return message
}
