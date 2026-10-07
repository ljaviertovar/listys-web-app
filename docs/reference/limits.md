# Reference Limits

Single source of truth for business limits.  
Source of truth: `src/lib/config/limits.ts`.

| Constant | Value | Description |
| --- | ---: | --- |
| `MAX_GROUPS_PER_USER` | 10 | Maximum number of shopping list groups a user can create |
| `MAX_ITEMS_PER_BASE_LIST` | 250 | Maximum items in a base list (via any method) |
| `MAX_TICKET_ITEMS_MERGE` | 200 | Maximum items to merge from a single OCR ticket |
| `MAX_SYNC_ITEMS` | 250 | Maximum items to sync from shopping session to base list |
| `MAX_IMAGES_PER_TICKET` | 5 | Maximum images per ticket upload |
| `MAX_OCR_ATTEMPTS` | 3 | Maximum OCR processing attempts per ticket |
| `OCR_PROCESSING_TIMEOUT_MINUTES` | 10 | Maximum processing time before a ticket is marked failed |
