// English-only on purpose: the app has no i18n layer yet. Both names are stored on the user's own rows when the default
// Pantry is provisioned (see the `ensure_default_pantry` database function), so changing them only affects new accounts.
export const DEFAULT_PANTRY_LIST_NAME = 'Pantry'

// The group is an implicit container the interface never shows: every list created without a group goes into it.
export const DEFAULT_PANTRY_GROUP_NAME = 'My Lists'
