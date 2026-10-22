# Tooling and delegation

Engineering constraints live in [AGENTS.md](../AGENTS.md). This document owns skill/tool selection and operational
boundaries; the [contribution guide](contributing/CONTRIBUTING.md) owns verification commands.

### Source of truth

- Project skill sources: `.agents/skills/`. `.github/skills/` contains copies used by another agent integration;
  `pnpm copy:skills` uses PowerShell to copy them. These paths are ignored for new files, so verify local availability
  rather than assuming a clean clone contains every installed skill.
- `pnpm skills:install` runs the AGENTS.md setup command, `npx skills install`; rerun it when project skills are added.
  `pnpm skills:check` and `pnpm skills:update` invoke the installed CLI's check/update commands.
- Read a skill's current `SKILL.md` when applying it. Do not treat an old conversation snapshot or copied command
  prompt as authoritative over the current skill.

### Mandatory Skill Loading Rule

**Before generating any output for a task that matches a skill trigger below, you MUST:**

1. Identify which skill(s) apply using the trigger table.
2. Load the matching `SKILL.md` file(s) with `read_file` as your **first action**.
3. Follow the skill instructions throughout the entire response.

### Skill Trigger Map

| Skill                          | File                                                   | Load when…                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next-best-practices`          | `.agents/skills/next-best-practices/SKILL.md`          | Creating or modifying any Next.js file: pages, layouts, route handlers, middleware, Server/Client Components, metadata, image/font usage, dynamic imports, or async params/cookies/headers.                  |
| `vercel-react-best-practices`  | `.agents/skills/vercel-react-best-practices/SKILL.md`  | Writing or refactoring React components or hooks; implementing data fetching (client or server); optimizing bundle size, re-renders, or load times; any performance-related task in a React/Next.js context. |
| `shadcn-ui`                    | `.agents/skills/shadcn-ui/SKILL.md`                    | Adding, customizing, or composing any shadcn/ui component; installing new UI primitives; building forms, dialogs, tables, or any UI that could be covered by the shadcn catalog.                             |
| `frontend-design`              | `.agents/skills/frontend-design/SKILL.md`              | Asked to build or redesign a UI component, page, landing section, dashboard, or any visual artifact where aesthetic quality and distinctive design are required.                                             |
| `web-design-guidelines`        | `.agents/skills/web-design-guidelines/SKILL.md`        | Reviewing existing UI code for accessibility, UX compliance, or design best-practice audits ("review my UI", "check accessibility", "audit this page").                                                      |
| `documentation-system-builder` | `.agents/skills/documentation-system-builder/SKILL.md` | Creating, updating, or auditing project documentation: PRDs, ADRs, architecture docs, runbooks, CHANGELOG, or any `docs/` content.                                                                           |
| `git-commit`                   | `.agents/skills/git-commit/SKILL.md`                   | When the user asks to commit changes, create a git commit, generate a Conventional Commit message, stage files intelligently, or mentions "/commit" or similar commit-related actions.                       |
| `openspec-explore` | `.agents/skills/openspec-explore/SKILL.md` | Exploring OpenSpec ideas, problems or requirements; also `opsx explore`. |
| `openspec-propose` | `.agents/skills/openspec-propose/SKILL.md` | Creating a proposed change and planning artifacts; also `opsx propose`. |
| `openspec-update-change` | `.agents/skills/openspec-update-change/SKILL.md` | Revising existing change planning artifacts; also `opsx update`. |
| `openspec-apply-change` | `.agents/skills/openspec-apply-change/SKILL.md` | Implementing the tasks of an OpenSpec change; also `opsx apply`. |
| `openspec-sync-specs` | `.agents/skills/openspec-sync-specs/SKILL.md` | Synchronizing a change's delta specs; also `opsx sync`. |
| `openspec-archive-change` | `.agents/skills/openspec-archive-change/SKILL.md` | Archiving completed changes; also `opsx archive`. |

### Skill Combination Examples

| Task                                               | Skills to load                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| Build a new Next.js page with shadcn/ui components | `next-best-practices` + `vercel-react-best-practices` + `shadcn-ui` |
| Create a visually distinctive landing section      | `frontend-design` + `vercel-react-best-practices`                   |
| Add a new shadcn/ui form to an existing page       | `shadcn-ui` + `next-best-practices`                                 |
| Audit and improve an existing component            | `web-design-guidelines` + `vercel-react-best-practices`             |
| Write a new ADR or update docs/                    | `documentation-system-builder`                                      |
| Optimize a slow data-fetching component            | `vercel-react-best-practices` + `next-best-practices`               |
| Prepare a conventional commit for staged changes   | `git-commit`                                                        |
| Finalize a feature and commit with proper scope    | `next-best-practices` + `git-commit`                                |

### OpenSpec and tool boundaries

The project now has `openspec/config.yaml` with schema `spec-driven`, plus `specs/` and `changes/`. Discover actual
changes/specs with the installed CLI rather than assuming a file's presence means planned work is complete. Follow the
selected skill for store resolution, root checks, artifact instructions and scope. Explore mode investigates; proposal,
implementation, sync and archive are distinct operations. Existing PRDs and documentation owners remain authoritative
for their topics.

- Inspect local files and read-only project context within the user's task. For updates already authorized by the user,
  proceed within that scope; obtain any explicit confirmation a workflow requires before expanding it.
- Keep production secrets, session cookies and real receipt data out of prompts to external tools, logs and artifacts.
- Verify environment identity before any Supabase mutation. Review every migration for direct/indirect record deletion;
  apply AGENTS.md confirmation rules and never run destructive migrations in tests.
- Do not delegate to additional agents unless the user or applicable instructions explicitly request delegation.
- Use connected services only for the authorized task; sending messages, publishing, or changing external state needs
  the relevant authorization. Tool availability alone is not permission.
- If an operation needs sandbox/network escalation, use the tool's approval mechanism and explain the exact operation.
  Do not work around a denied action with a different tool.
