/** Bottom offset for controls that float directly above the mobile tab bar. */
export const ABOVE_MOBILE_TAB_BAR = 'bottom-[calc(3rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Bottom offset for a bar that floats above the raised upload button, which stands 28px proud of the tab bar. */
export const ABOVE_MOBILE_UPLOAD_BUTTON = 'bottom-[calc(6.25rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Reserves the tab bar, its raised upload button and a 24px gap above that button. */
export const MOBILE_TAB_BAR_CLEARANCE = 'pb-[calc(4.5rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Bottom offset for a bar that floats above the active-session bar (48px high with an 8px gap) that sits over the tab bar. */
export const ABOVE_MOBILE_SESSION_BAR = 'bottom-[calc(9.75rem+max(1.125rem,env(safe-area-inset-bottom)))]'

/** Extra space a page needs at its end while the active-session bar floats over the tab bar. */
export const MOBILE_SESSION_BAR_CLEARANCE = 'h-14'
