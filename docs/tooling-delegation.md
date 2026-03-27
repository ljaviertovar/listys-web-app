### Source of truth

- Skills: `.agents/skills/` · `.github/skills/` · `./agent/skills/`

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
