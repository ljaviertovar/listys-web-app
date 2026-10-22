/** Maps known auth errors to a useful repair and keeps provider details out of user-facing copy. */
export function describeAuthError(message: string | undefined, fallback: string): string {
	if (!message) return fallback
	if (/invalid login credentials/i.test(message)) {
		return 'We couldn’t sign you in. Check your details and try again.'
	}
	return fallback
}
