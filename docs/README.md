# Listys documentation

Listys helps users build reusable shopping lists from receipts, shop from those lists, and review purchase history.
This page is the documentation index and topic-ownership map. Requirements describe intended behavior;
the implementation reference describes repository evidence. Neither establishes production readiness.

## Start here

| Task | Canonical document |
| --- | --- |
| Set up the web app and find commands | [Root README](../README.md) |
| Understand MVP users, journeys, and acceptance criteria | [PRD v2](prd/PRD-v2.md) |
| Read the earlier product definition | [PRD v1](prd/PRD-v1.md) — historical |
| See implemented features and unresolved gaps | [Implementation status](reference/implementation-status.md) |
| Understand runtime boundaries, data flows, and security | [Architecture](architecture/architecture.md) |
| Find code and decide where new files belong | [Project structure](architecture/project-structure.md) |
| Find REST routes, schemas, and compatibility behavior | [API v1 reference](reference/api-v1.md) |
| Check business limits | [Limits reference](reference/limits.md), derived from `src/lib/config/limits.ts` |
| Design or visually validate a component | [Design system v2](design/DESIGN.md), including canvas links and section 11.4 gaps |
| Understand account, receipt, sharing and browser data | [Privacy and data handling](privacy/taste-profile.md) |
| Develop, verify, or submit changes | [Contribution guide](contributing/CONTRIBUTING.md) |
| Deploy or recover service | [Deploy runbook](runbooks/deploy.md) and [incident runbook](runbooks/incidents.md) |
| Select skills and tools | [Tooling and delegation](tooling-delegation.md) |
| Follow automated-contributor constraints | [AGENTS.md](../AGENTS.md) |
| Read change history and commit conventions | [Changelog](../CHANGELOG.md) and [commit guide](git-commits.md) |

## Scope and maintenance

- **MVP:** receipt capture/OCR, reusable lists and enrichment, shopping sessions, and history, governed by PRD v2.
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
