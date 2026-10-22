/** Bottom offset for controls that finish at the top edge of the 78px mobile tab bar. */
export const ABOVE_MOBILE_TAB_BAR = 'bottom-[calc(3.75rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Bottom offset for the session bar wrapper; its 8px bottom pad leaves the link 8px above the tab bar. */
export const ABOVE_MOBILE_UPLOAD_BUTTON = 'bottom-[calc(3.75rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Reserves the mobile tab bar's full height so the final row can scroll above it. */
export const MOBILE_TAB_BAR_CLEARANCE = 'max-lg:pb-[calc(3.75rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Bottom offset for a 56px action bar that sits 8px above the active-session bar. */
export const ABOVE_MOBILE_SESSION_BAR = 'bottom-[calc(7.75rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Extra space a page needs at its end while the active-session bar floats over the tab bar. */
export const MOBILE_SESSION_BAR_CLEARANCE = 'h-14'

/** Adds 24px to the dashboard's 16px content gutter to keep A1's 40px end gap before the session-bar spacer. */
export const MOBILE_DASHBOARD_SESSION_CLEARANCE = 'max-lg:pb-6'
