// =============================================
// DATA LIMITS AND VALIDATION RULES
// =============================================
// Purpose: Document maximum limits for arrays and collections to prevent DoS attacks
// Last Updated: 2026-01-21

/\*\*

- CONFIGURABLE LIMITS
- All limits are now centralized in: src/lib/config/limits.ts
- This allows easy modification for different user plans or business requirements
  \*/

/\*\*

- GROUPS
- - Max groups per user: 10 (configurable in limits.ts)
- - Validation: Enforced in createGroup server action
- - Rationale: Typical users have 3-5 categories (groceries, household, etc.)
- - Future: Can be increased for premium plans
    \*/

/\*\*

- BASE LISTS
- - Max items per base list: 60 (configurable in limits.ts)
- - Validation: Enforced in createBaseListItem, mergeTicketItems, syncRunToBaseList
- - Rationale: Typical shopping lists have 15-30 items, 60 provides safety margin
- - Protection: Prevents both manual additions and batch operations from exceeding limit
    \*/

/\*\*

- TICKET OPERATIONS
- - Max items per ticket merge: 200 items (configurable in limits.ts)
- - Max items when creating base list from ticket: 60 items (enforced by base list limit)
- - Validation: Enforced in mergeTicketItemsSchema and createBaseListFromTicketSchema
- - Rationale: OCR typically extracts 10-50 items per receipt, 200 provides safety margin
    \*/

/\*\*

- SHOPPING SESSION OPERATIONS
- - Max items to sync from session to base list: 60 items (enforced by base list limit)
- - Max sync items overall: 500 items (configurable in limits.ts, safety backstop)
- - Validation: Enforced in syncSessionToBaseList function
- - Natural bound: Shopping sessions inherit items from base lists (bounded by base list limit)
- - Rationale: Typical shopping trips have 20-100 items
    \*/

/\*\*

- STRING LENGTH LIMITS
- - Group names: 100 characters
- - Base list names: 100 characters
- - Shopping session names: 100 characters
- - Item names: 200 characters
- - Descriptions: 500 characters
- - Notes/General notes: 500-1000 characters
- - Units: 20 characters
- - Categories: 50 characters
- - Store names: 100 characters
    \*/

/\*\*

- NUMERIC LIMITS
- - Quantities: Must be positive numbers (> 0)
- - Total amounts: Must be positive numbers (> 0)
- - Sort order: Integer values
    \*/

/\*\*

- PERFORMANCE CONSIDERATIONS
- - Database indexes on foreign keys prevent slow queries
- - RLS policies ensure users only access their own data
- - Pagination not required for current limits (typical users have < 100 items per list)
- - Future: Add pagination if users regularly exceed 200 items per list
    \*/

/\*\*

- SECURITY NOTES
- - All validations happen server-side (never trust client data)
- - Zod schemas provide type safety and runtime validation
- - Unknown data types used in server actions force explicit validation
- - Array limits prevent memory exhaustion attacks
    \*/
