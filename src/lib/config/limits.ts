// =============================================
// APPLICATION LIMITS CONFIGURATION
// =============================================
// Purpose: Centralized configuration for business logic limits
// Last Updated: 2026-01-21
// Note: These values can be easily adjusted based on plan tiers or user requirements

/**
 * GROUPS LIMITS
 */
export const MAX_GROUPS_PER_USER = 10 // Maximum number of shopping list groups a user can create

/**
 * BASE LISTS LIMITS
 */
export const MAX_ITEMS_PER_BASE_LIST = 60 // Maximum number of items in a single base list

/**
 * TICKET OPERATIONS LIMITS
 */
export const MAX_TICKET_ITEMS_MERGE = 200 // Maximum items that can be merged from a ticket at once

/**
 * SHOPPING RUN LIMITS
 */
export const MAX_SYNC_ITEMS = 500 // Maximum items that can be synced from run to base list

/**
 * FUTURE ENHANCEMENT IDEAS:
 * - Make these limits configurable per user plan (free, pro, enterprise)
 * - Store in database or environment variables
 * - Add admin interface to modify limits
 * - Implement usage tracking and analytics
 */

/**
 * PLAN-BASED LIMITS (Future Implementation)
 *
 * FREE_PLAN = {
 *   MAX_GROUPS: 5,
 *   MAX_ITEMS_PER_LIST: 30,
 *   MAX_ACTIVE_SHOPPING_RUNS: 1
 * }
 *
 * PRO_PLAN = {
 *   MAX_GROUPS: 20,
 *   MAX_ITEMS_PER_LIST: 100,
 *   MAX_ACTIVE_SHOPPING_RUNS: 5
 * }
 *
 * ENTERPRISE_PLAN = {
 *   MAX_GROUPS: unlimited,
 *   MAX_ITEMS_PER_LIST: 500,
 *   MAX_ACTIVE_SHOPPING_RUNS: unlimited
 * }
 */
