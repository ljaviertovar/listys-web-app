# Incident runbook

Use for auth/API errors, stuck receipts, storage failures or experimental sharing issues.
[Open question: assign incident ownership, escalation channel, alert thresholds and backup/restore ownership.]
The repository does not establish configured alerts, a maintenance-mode switch or a durable OCR queue.

## Triage and evidence

1. Record environment, start time, recent deployment/migration, impact and affected flow. Preserve the release/commit ID.
2. Check `GET /api/health` for API/database availability; `200` does not establish working Auth, Storage, OCR or realtime.
3. Capture safe statuses, timestamps, relevant record IDs and `error.request_id` when provided. Never publish credentials,
   cookies, invite links, signed image URLs, provider payloads or receipt contents. Request IDs do not prove a tracing pipeline.
4. Inspect redacted Next.js/function logs and compare provider/target configuration with the [setup guide](../../README.md).
   Do not print secrets to diagnose missing configuration.

## Flow-specific recovery

| Symptom | Check | Controlled next action |
| --- | --- | --- |
| Sign-in/redirect failure | Auth configuration, callback origin, cookies and failing route. | Correct reviewed configuration; re-authenticate with a test account. |
| Receipt stuck pending/processing | Status/attempts, signed-URL generation, function availability and provider errors. | Diagnose dispatch first. Retry only after checking state/limits; retry clears extracted items. |
| Session completed but list did not sync | Completion response and sync RPC error. | Inspect both records before scoped repair; completion and sync are separate writes. |
| Deleted receipt still occupies storage | Deletion logs and exact affected object paths. | Inspect orphan reports without mutation, then prepare a scoped cleanup plan. |
| Experimental invite/realtime failure | Link expiry/revocation/uses, membership, RLS and publication. | Validate with isolated accounts; link revocation differs from collaborator removal. |

Maintenance handlers can mark stuck tickets failed or remove orphaned images. These mutate state and may have broader
scope than the request's user. Inspect the database function and affected records before authorizing execution. Do not
run cleanup scripts, broad resets or destructive migrations during diagnosis. See
[`tickets.service.ts`](../../src/lib/server/services/tickets.service.ts) and the [API inventory](../reference/api-v1.md).

## Containment, restoration and follow-up

Restore the previous compatible web release for deployment regressions using the [deploy runbook](deploy.md#recovery).
Application rollback does not reverse data changes. The release owner must choose a verified provider-incident
mitigation; switching OCR providers requires a deployed alternate function and its secrets, not just a selector value.

Validate the affected flow with synthetic fixtures. Monitor actual available logs/metrics and record timeline, root
cause, data impact, remediation and follow-up owner. Add an ADR only for an architectural decision. Record unresolved
retention/deletion issues in the [privacy reference](../privacy/taste-profile.md).
