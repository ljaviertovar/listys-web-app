

/**
 * Receipts print item names in capitals ("PC MINI TORTILLA"). They are shown in Title Case, keeping short codes
 * ("PC", "BD") and weights ("500G" becomes "500g") readable. The stored value is never changed, and a name that already
 * has lowercase letters is the user's own and is left alone.
 */
export function formatItemName(name: string): string {
	if (name === name.toUpperCase() && name !== name.toLowerCase()) {
		return name
			.split(/(\s+)/)
			.map(token => {
				if (/^\s*$/.test(token)) return token
				if (/^\d/.test(token)) return token.toLowerCase()
				if (token.length <= 2) return token
				return token.charAt(0) + token.slice(1).toLowerCase()
			})
			.join('')
	}
	return name
}
