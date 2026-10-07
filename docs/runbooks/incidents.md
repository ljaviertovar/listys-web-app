# Incidents Runbook

## Purpose

Procedure for incident response and rapid application recovery.

## Detection

- Monitor Edge Function and Supabase logs.
- Alert on 5xx errors, OCR queue backlog, or migration failures.

## Immediate actions

1. Triage: identify the scope (all users, a subset, or a background process).
2. If there is a crash or 5xx response, enable maintenance mode if necessary.
3. Collect relevant logs and create a prioritized issue in the tracker.

## Containment

- Roll back the recent deployment if the incident was caused by a deployment.
- Pause batch/OCR processing if usage exceeds quotas.

## Recovery

1. Apply a hotfix on a `hotfix/*` branch and deploy it to staging.
2. Validate the fixes in staging and then promote them to production.

## Postmortem

- Document the root cause, timeline, and preventive actions.
- Create an ADR if the decision requires architectural changes.
