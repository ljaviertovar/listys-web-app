## Purpose

Allow maintainers to run E2E tests against local Supabase with independently owned fixtures, while preventing test
configuration, parallel execution or cleanup from affecting production or unrelated local data.

## ADDED Requirements

### Requirement: Explicit local test configuration

Every E2E entry point SHALL require `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY` and
`E2E_SUPABASE_SERVICE_ROLE_KEY`. The harness MUST validate the Supabase endpoint and browser application origin as
approved loopback destinations before starting the application or making any test data request. It MUST NOT fall
back to ordinary application credentials, accept remote hosts or follow Supabase redirects to a remote destination.
Configuration errors SHALL identify the invalid field without printing secrets.

#### Scenario: Only application credentials are available
- **WHEN** ordinary application credentials exist but required E2E inputs are missing
- **THEN** execution fails before launching the application or creating a Supabase client
- **AND** no seeding or cleanup request is made

#### Scenario: A destination is remote or invalid
- **WHEN** a configured endpoint uses a non-loopback host, an unapproved port, embedded credentials, an unexpected
  path, an invalid URL, or an application origin outside the validated local configuration
- **THEN** execution fails before connecting or performing side effects

#### Scenario: A Supabase response redirects outside the approved origin
- **WHEN** a validated local endpoint returns a redirect to a remote origin
- **THEN** the request fails without forwarding credentials or contacting that remote origin

### Requirement: Dedicated application process

Browser E2E tests SHALL use a dedicated application process whose Supabase URL and publishable key come from the
validated E2E inputs. Server-only privileged credentials SHALL be derived from the same inputs and MUST NOT enter
browser-accessible configuration. The harness MUST NOT attach to an existing development server or accept browser
navigation to an unapproved application origin.

#### Scenario: An existing development server occupies the selected port
- **WHEN** another process already serves the configured E2E application port
- **THEN** the harness fails clearly instead of reusing that server

#### Scenario: Application environment targets a different Supabase project
- **WHEN** ordinary application configuration points elsewhere and valid local E2E inputs are supplied
- **THEN** the dedicated application process uses only the validated local Supabase configuration
- **AND** test navigation and authenticated API requests use its validated local application origin

### Requirement: Distinct fixture ownership per test attempt

Each test attempt SHALL own a distinct fixture scope, including all users, rows and Storage objects it creates.
Parallel workers and retries MUST receive different fixture identities. A test creating multiple users or resources
through the UI SHALL track all of them in its own scope. Selecting the first unrelated record or sharing a mutable
pre-existing account MUST NOT substitute for creating the test's fixtures.

#### Scenario: Two tests create similar resources concurrently
- **WHEN** separate workers create accounts and lists with similar human-readable names
- **THEN** their identities and resources remain distinguishable by exact ownership
- **AND** each test can operate on its own resources without selecting or changing the other's

#### Scenario: A failed test is retried
- **WHEN** the runner starts another attempt of the same test
- **THEN** the new attempt receives a fresh fixture scope
- **AND** any remaining resources from the previous attempt are not silently adopted

### Requirement: Real authenticated fixture identity

Authenticated fixtures SHALL return the actual account identifiers and session identity they created. Business
operations and authorization tests MUST use the appropriate real user session against local Supabase; privileged
access SHALL be restricted to explicitly authorized fixture setup, inspection and cleanup. Credentials MUST be
generated or supplied through the validated E2E environment, not embedded defaults. Supabase MUST NOT be mocked in E2E.

#### Scenario: A browser fixture signs in
- **WHEN** a test obtains an authenticated browser and its account information
- **THEN** the browser is signed in as that newly created account
- **AND** the returned user ID, email and credentials belong to the same fixture rather than placeholder browser values

#### Scenario: A test checks access between two users
- **WHEN** a fixture creates two users and performs a protected operation as one of them
- **THEN** the request executes with that user's real session rather than privileged fixture credentials
- **AND** both users remain registered to the creating test's cleanup scope

### Requirement: Exact resource cleanup

Cleanup SHALL affect only resources recorded as owned by its test scope. It MUST validate the local target and scope
before every cleanup operation, remove owned Storage objects and dependent records in a safe order, and delete only
explicitly recorded fixture users. Table-wide resets, prefix-based user sweeps, database resets, and unscoped cleanup
MUST NOT be available through any E2E entry point.

#### Scenario: Unrelated local data exists
- **WHEN** cleanup runs for a completed test while a separately owned synthetic sentinel account, row and Storage
  object exist in the same local environment
- **THEN** the test's owned resources are removed
- **AND** every sentinel resource remains readable and unchanged

#### Scenario: A scope attempts to remove an unowned identifier
- **WHEN** cleanup is asked to remove a resource absent from its recorded ownership
- **THEN** cleanup rejects that operation before sending a deletion request
- **AND** no broader search or delete is used as a fallback

### Requirement: Failure-safe fixture lifecycle

Successfully created fixture resources SHALL be recorded immediately so cleanup remains possible after partial setup
or assertion failures. Cleanup SHALL be safe to repeat for already removed owned resources. Cleanup failures MUST be
visible in the test result and MUST NOT trigger broader deletion; reports MUST exclude credentials and sensitive URLs.

#### Scenario: Setup fails after creating a user
- **WHEN** a later fixture creation step fails before the test body runs
- **THEN** teardown attempts cleanup of the already recorded resources in that scope
- **AND** it does not require successful completion of fixture setup to find those resources

#### Scenario: Cleanup fails or is repeated
- **WHEN** an owned resource cannot be removed, or cleanup is invoked after some owned resources are already gone
- **THEN** missing owned resources are handled idempotently and actual failures are reported
- **AND** cleanup never expands its scope to find additional records or users

### Requirement: Safe local provisioning boundary

E2E setup and execution SHALL use an already provisioned local Supabase environment. They MUST NOT apply migrations,
reset the database, truncate tables, or erase unrelated existing records to prepare tests. An unavailable local service
or incompatible schema SHALL produce a clear failure without attempting automatic repair against any environment.

#### Scenario: Local Supabase is unavailable or lacks required schema
- **WHEN** preflight cannot use the validated local service or required schema
- **THEN** execution fails with actionable provisioning information
- **AND** it does not select a remote fallback, run migrations or reset local data

### Requirement: All existing test entry points enforce the boundary

The default runner, individual test files, fixture factories, setup/teardown hooks and manual test-user utilities SHALL
enforce the same target and ownership requirements. Legacy reset-approval flags MUST NOT authorize broader access.
Existing test files SHALL migrate to this contract instead of being silently excluded to obtain a passing result.

#### Scenario: A helper or manual utility is invoked directly
- **WHEN** it is called without a validated local configuration and a valid ownership scope
- **THEN** it fails before creating, reading or deleting test data

#### Scenario: A legacy reset flag is supplied
- **WHEN** execution includes the former broad-reset approval flag
- **THEN** it cannot enable remote execution, table-wide deletion or prefix-based account cleanup

### Requirement: Verifiable isolation and honest results

The foundation SHALL provide focused target/ownership guard tests and a real-local-Supabase verification flow.
Verification MUST demonstrate valid authenticated application access, parallel fixture independence, preservation of
unowned synthetic sentinels and cleanup after an induced setup or test failure. Harness results SHALL be reported
separately from unrelated product failures; assertions MUST NOT be weakened or tests silently skipped to claim stability.

#### Scenario: Foundation checks execute
- **WHEN** the local foundation verification runs with two concurrent fixture scopes and repeats
- **THEN** each scope performs an authenticated application read/write and cleans up only its resources
- **AND** an induced failure leaves its successfully created fixtures eligible for exact cleanup
- **AND** separately owned sentinel resources survive each other scope's cleanup

#### Scenario: An unrelated product assertion fails
- **WHEN** safe execution exposes an existing application or schema behavior failure
- **THEN** the failure remains visible and is recorded as follow-up evidence
- **AND** a passing foundation check is not reported as proof that the entire application suite passed
