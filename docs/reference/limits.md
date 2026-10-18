# Reference Limits

Reference derived from [`src/lib/config/limits.ts`](../../src/lib/config/limits.ts), which owns these values.
Check parity with `pnpm verify:limits-reference`. A timeout threshold does not establish that a scheduler is deployed.

| Constant | Value | Description |
| --- | ---: | --- |
| `MAX_GROUPS_PER_USER` | 10 | Maximum number of shopping list groups a user can create |
| `MAX_ITEMS_PER_BASE_LIST` | 250 | Maximum items in a base list (via any method) |
| `MAX_TICKET_ITEMS_MERGE` | 200 | Maximum items to merge from a single OCR ticket |
| `MAX_SYNC_ITEMS` | 250 | Maximum items to sync from shopping session to base list |
| `MAX_IMAGES_PER_TICKET` | 5 | Maximum images per ticket upload |
| `MAX_TICKET_IMAGE_MB` | 10 | Maximum size per receipt photo in MiB (10 × 1024 × 1024 bytes) |
| `MAX_OCR_ATTEMPTS` | 3 | Configured OCR attempt cap; enforcement differs by provider |
| `OCR_PROCESSING_TIMEOUT_MINUTES` | 10 | Configured stuck-processing threshold; not proof of an installed scheduler |

The Gemini function enforces its own three-attempt cap. The OpenAI function increments attempts but does not currently
apply that cap; the web retry service also does not enforce it. See the
[implementation gaps](implementation-status.md#prd-v2-acceptance-gaps) before assuming uniform retry guarantees.
