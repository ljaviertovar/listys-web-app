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
 * BASE LISTS & SHOPPING RUNS LIMITS
 *
 * IMPORTANT: These limits are designed to maintain consistency across the entire app lifecycle:
 *
 * 1. MAX_ITEMS_PER_BASE_LIST (250):
 *    - Applies when creating/editing base lists manually
 *    - Applies when creating base lists from OCR tickets
 *    - Maximum capacity for a base list (via any method)
 *
 * 2. MAX_SYNC_ITEMS (250):
 *    - Matches MAX_ITEMS_PER_BASE_LIST to prevent inconsistent states
 *    - Allows syncing shopping runs back to base lists without exceeding limit
 *    - Prevents the scenario: list with 250 items → sync fails → user confusion
 *
 * 3. MAX_TICKET_ITEMS_MERGE (200):
 *    - Lower than base list limit (most receipts have <100 items)
 *    - Still allows creating new base lists from large tickets
 *    - If ticket has 200 items, user can create a new list (200 < 250 ✓)
 *
 * RATIONALE:
 * - Consistent limits prevent impossible states (e.g., list with 300 items that can't add more)
 * - 250 items supports large shopping trips (Costco, Sam's Club, restaurant supply)
 * - PostgreSQL handles 250 rows efficiently (<25KB of JSON data)
 * - Future: implement UI pagination/virtualization for lists >50 items
 */
export const MAX_ITEMS_PER_BASE_LIST = 250 // Maximum items in a base list (via any method)
export const MAX_TICKET_ITEMS_MERGE = 200  // Maximum items to merge from a single OCR ticket
export const MAX_SYNC_ITEMS = 250          // Maximum items to sync from shopping run to base list

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
