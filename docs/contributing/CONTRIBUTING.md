# Contributing

Thanks for contributing to Listys. These are the basic collaboration guidelines.

## Local development

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Run linters and tests before opening a PR:

```bash
pnpm lint
pnpm test
```

3. Use the following branch prefixes: `feat/`, `fix/`, `chore/`, `hotfix/`.

## Pull Requests

- Title: use Conventional Commits (for example, `feat(tickets): add multi-image upload`).
- Include a change description, issue reference, and testing steps.
- Add tests when applicable.

## Code and quality

- Strict TypeScript: avoid `any` unless there is a documented justification.
- Server-side validation for all new input.

## Reporting bugs

- Open an issue with reproduction steps, environment details, and logs when applicable.
