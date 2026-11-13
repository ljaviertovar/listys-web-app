# Design System workflow for UI work

[AGENTS.md](../../AGENTS.md) links here: read this file before creating or changing UI, running the Design System gate or
audit, or touching `docs/design/`. Engineering constraints stay in AGENTS.md; if the two disagree, AGENTS.md wins.

The Listys Design System (DS) at `docs/design/design-system.html` is the only source of truth for how components look
and behave. It is maintained by the `build-app-design-system` skill, which also checks code against it.

**Status: the DS exists** (`docs/design/design-system.html`, v1.8.0) and is the only source of truth. Earlier design
documents are historical references.

## Older design documents

- [docs/design/listys-design-system.html](../design/listys-design-system.html) and
  [docs/design/DESIGN.md](../design/DESIGN.md) are retained as historical references; they do not override the DS.
- When an implementation plan contains **Batch 0 — Source-of-truth handover**, do it first: update the listed
  references in instructions and docs (including `AGENTS.md` and `docs/`) exactly as written, delete only the files the
  plan lists as confirmed by the user, and fix the listed code comments. This is your job, not the skill's: the skill
  never edits files outside its own.

## Before you write UI

- Read the DS. Use its tokens, radii, surfaces, type scale, sizes, variants, states and copy rules; do not invent values
  or follow another design reference when it conflicts with the DS.
- Express the design through the shared layer (theme tokens in `src/app/globals.css`, variants and sizes in
  `src/components/ui/`), as the Styling rules in [AGENTS.md](../../AGENTS.md) require. When the DS draws something no existing variant or token
  can express, add the variant or token there and reuse it by name.
- When no HTML example covers the component, derive it from the closest DS pattern and say which one was used. Do not
  ship a one-off look.
- Never edit the DS (`docs/design/design-system.html`) or `docs/design/audit-findings/` yourself; only the skill
  changes them. The older documents may be edited only as Batch 0 says, or to keep `DESIGN.md` in sync before the DS
  exists.

## When to run the skill

| Situation | Run |
| --- | --- |
| You created, modified or deleted a UI component (or a variant, state or prop), styles, tokens, theme or global CSS that affect components, or a screen that composes components with its own styling (`src/components/**`, `src/app/globals.css`, `tailwind.config.ts`, pages under `src/app/**`) | **Gate** after the code is done: `/appds:gate <files>` |
| The user asks to audit the app, check DS alignment, report drift or find missing components | **Audit**: `/appds:audit` |
| The user confirms the audit's plan was implemented | **Verify**: `/appds:verify` |
| New components or screens must be added to the DS itself | **Update**: `/appds:update` |
| The DS needs a new component or screen definition | **Update**: `$appds-update` |

In Codex use `$appds-gate`, `$appds-audit`, `$appds-verify`, `$appds-update`, `$appds-init`; other agents ask for the
skill by name. The gate does not apply to logic-only changes, tests, copy edits that do not change styling, or non-UI
code. If the skill is not installed locally (`.claude/skills/` is git-ignored), say so instead of skipping the gate
silently.

## Gate: after the code and before reporting the task as done

1. Invoke the skill in **gate mode** with "gate check after UI changes" and the files and component names you
   created, modified or deleted (or the git diff). Do not ask it to audit the whole app.
2. Read its result:
   - `GATE: PASS` → continue. Mention "DS gate: PASS" in the final message, plus any DS changes the skill made.
   - `GATE: FAIL` → fix **every** listed issue (Critical, High, Medium) in the code, following each issue's fix
     guidance and acceptance criteria, then call the gate again with the same scope. Do not ask for approval to fix
     and do not argue with an issue by editing the DS. Fix Low-severity advisories when the fix is trivial.
   - `GATE: NEEDS DECISION` → stop. Do not guess. Put the question and options in the final message and say which part
     of the work is blocked.
   - `GATE: NOT RUN` (no DS, DS unreachable, skill missing) → say so plainly and never describe the work as DS-aligned.
     If no DS exists yet, add one line suggesting `/appds:init` (`$appds-init` in Codex). **Only suggest it:** do not
     initialize or create the DS, or start the init flow, unless the user explicitly tells you to.
3. Maximum 3 gate rounds. If it still is not PASS, stop and report the remaining issues; never weaken or work around a
   check to get a PASS. Do not show gate output as a report or wait for approval between rounds.
4. Deleting components: delete the code as asked, then run the gate with the deleted names. The skill leaves the DS
   definition in place and marks it "not implemented yet"; retiring it from the DS is the user's decision.
5. An explicit audit request runs audit mode instead: show the visual report
   (`docs/design/audit-findings/report.html`) and the implementation plan, **wait for the user's confirmation**,
   implement the plan batch by batch, then run verify. The findings folder is emptied only after the user approves
   closing the audit. Leave nothing in it yourself.
6. The gate reads code and renders its own HTML only: do not run the build or tests to satisfy it, and it does not
   replace the visual check in AGENTS.md "Testing Expectations".
