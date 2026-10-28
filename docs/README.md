# Listys documentation

Listys helps users build reusable shopping lists from receipts, shop from those lists, and review purchase history.
This page is the documentation index and topic-ownership map. Requirements describe intended behavior;
the implementation reference describes repository evidence. Neither establishes production readiness.

## Start here

| Task | Canonical document |
| --- | --- |
| Set up the web app and find commands | [Root README](../README.md) |
| Understand MVP users, journeys, and acceptance criteria | [PRD v2](prd/PRD-v2.md) |
| Read the product direction after the MVP and its phased plan | [PRD v3](prd/PRD-v3.md) — draft; it supersedes only the parts of PRD v2 it lists. Phase 1 is specified in the OpenSpec change `pantry-defaults-and-price-memory` (archived) and Phase 2 (flat lists) in `flat-lists-hide-groups` |
| Read the earlier product definition | [PRD v1](prd/PRD-v1.md) — historical |
| See implemented features and unresolved gaps | [Implementation status](reference/implementation-status.md) |
| Understand runtime boundaries, data flows, and security | [Architecture](architecture/architecture.md) |
| Find code and decide where new files belong | [Project structure](architecture/project-structure.md) |
| Find REST routes, schemas, and compatibility behavior | [API v1 reference](reference/api-v1.md) |
| Check business limits | [Limits reference](reference/limits.md), derived from `src/lib/config/limits.ts` |
| Design or visually validate a component | [Design system v2 HTML](design/listys-design-system-v2.html) and its [written specification](design/DESIGN.md), including section 11.4 gaps |
| Understand account, receipt, sharing and browser data | [Privacy and data handling](privacy/taste-profile.md) |
| Develop, verify, or submit changes | [Contribution guide](contributing/CONTRIBUTING.md) |
| Deploy or recover service | [Deploy runbook](runbooks/deploy.md) and [incident runbook](runbooks/incidents.md) |
| Select skills and tools | [Tooling and delegation](tooling-delegation.md) |
| Follow automated-contributor constraints | [AGENTS.md](../AGENTS.md) |
| Read change history and commit conventions | [Changelog](../CHANGELOG.md) and [commit guide](git-commits.md) |

## Scope and maintenance

- **MVP:** receipt capture/OCR, reusable lists and enrichment, shopping sessions, and history, governed by PRD v2.
- **Direction:** PRD v3 refines the MVP in phases. Phase 1 (always sync on completion, a default "Pantry" list, visible
  average price and estimated total), Phase 2 (flat lists: groups hidden from the interface, history filtered by list) and
  Phase 3 includes the stores foundation (store read from receipts, normalized "My Stores", rename/merge, and receipt
  lines linked to existing items), Phase 4 adds usual-store tags and store-scoped sessions, and Phase 5 adds printed
  receipt totals, receipt-to-trip reconciliation, and owner-only comparison of latest recorded prices by store. The Phase
  5 code, additive migration and verification script are prepared; database application remains pending an approved
  target. Prices are from the user's own receipt history, not live or external price feeds. A trip supports one receipt,
  and an attached receipt cannot be detached.
- **Experimental:** shared lists, invitations, collaborators, and collaborative realtime shopping. The product owner
  confirmed on 2026-10-17 that these remain outside the MVP.
- **Planning:** `openspec/` holds specifications and planned changes; its local configuration uses `spec-driven`.
  Planning artifacts do not replace the PRD or establish that a feature shipped.
- **Architecture decisions:** no ADR files are currently versioned. Add an ADR only for a real decision with recorded
  context, alternatives, and consequences.

Keep one owner per topic. Update its document when behavior changes and link to it elsewhere instead of duplicating
inventories. Preserve PRD history; create a new version only for a product revision, not technical reconciliation.

The 2026-10-17 audit compared repository source, configuration, tests, and migrations. It did not inspect deployed
Supabase state, production telemetry, hosting configuration, or the visual canvas. See the
[audit findings](reference/implementation-status.md#audit-findings-and-follow-up) for remaining work.
