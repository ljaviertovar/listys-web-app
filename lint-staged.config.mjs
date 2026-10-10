/**
 * Runs on the files staged for a commit (see .husky/pre-commit).
 * - ESLint reports errors only (--quiet): warnings never block a commit, errors do.
 * - Vitest runs only the tests that import the staged files (`related`), so touching a component runs its tests and
 *   nothing else. The always-on critical suite (`pnpm test:critical`) is run separately by the hook.
 */
const config = {
	'src/**/*.{ts,tsx}': ['eslint --quiet', 'vitest related --run --passWithNoTests'],
}

export default config
