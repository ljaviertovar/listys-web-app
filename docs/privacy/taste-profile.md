# Privacy preferences and data handling

Repository evidence and unresolved product decisions as of 2026-10-17. This is an engineering reference, not a published
privacy notice or a legal-compliance claim.

## Data and purpose

| Data | Observed use/storage | Evidence |
| --- | --- | --- |
| Identity and provider metadata | Supabase Auth identity/session; account/profile display email, provider and verification metadata. | [`Auth clients`](../../src/lib/supabase/), [`settings`](../../src/app/(authenticated)/settings/) |
| Lists, quantities, notes and categories | Planning and shopping snapshots in Postgres. | [`base-list service`](../../src/lib/server/services/base-lists.service.ts), [`session service`](../../src/lib/server/services/shopping-sessions.service.ts) |
| Receipt photos and purchases | User-prefixed Storage paths; ticket metadata/items in Postgres; signed URLs for OCR/viewing. | [`ticket service`](../../src/lib/server/services/tickets.service.ts) |
| Purchase memory | Normalized names, purchase counts, first/last timestamps and average prices enrich items. | [`enrichment migration`](../../supabase/migrations/20260214000000_prd_v2_enrichment_and_transactions.sql) |
| Experimental sharing | Invite tokens, optional expiry/use limits, collaborator roles and participation. | [`sharing service`](../../src/lib/server/services/sharing.service.ts) |

## External processing and consent

Receipt content is processed through Gemini or OpenAI according to the configured OCR function. The functions send
image content to their provider APIs. See [`functions/`](../../supabase/functions/) and
[`provider configuration`](../../src/lib/config/ocr.ts).

[Open question: approve disclosure for third-party receipt processing and confirm provider region, retention,
training/data-use settings and contractual requirements for deployed accounts.]

Sharing remains experimental/outside the MVP. Accepted links grant list access; expiry and use limits can be unset.
Revoking a link does not remove admitted collaborators. Keep invite URLs out of public logs/screenshots.
[Open question: define default invite expiry and the user-facing household sharing/consent copy.]

## Access, retention, and deletion

- Server queries and RLS establish the intended access boundary; shared access also uses collaborator policies.
  Invite acceptance uses an admin client after application checks. Remote installed policies were not validated.
- Upload/retry creates one-hour signed image links. Link expiry does not delete the stored image.
- Receipt deletion attempts Storage API removal before deleting the row. Storage failure is logged and can leave
  orphaned images. Cascades/maintenance functions do not prove a verified full deletion policy.
- No self-service account deletion, full export or time-based receipt-retention policy was found in inspected flows.
  Account/profile settings currently display metadata.
- [Open question: define retention for images, extracted items, purchase memory, logs and backups; assign ownership
  for export/deletion requests and orphaned-image recovery.]

## Browser and operational data

[`sw.js`](../../public/sw.js) caches the public shell/static assets, excludes API/auth/storage paths from its asset-cache
branch, and uses an offline document for navigation failures. It does not synchronize shopping mutations offline.
Session cookies and client state still require normal access controls.

Follow [AGENTS.md](../../AGENTS.md) for secrets/log handling. Commit synthetic receipts only; redact tokens, invite links,
signed URLs, identities and receipt contents from shared evidence. Provider debug logs need review before assuming
operational logs are redacted. No jurisdiction, legal basis or compliance certification is inferred from the code.
