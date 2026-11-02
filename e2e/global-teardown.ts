/**
 * Playwright Global Teardown
 *
 * Runs once after all tests. It no longer wipes anything: a table-wide reset also erased the data of whoever shared the
 * database. Data a test creates is removed by that test's own fixture, which owns only what it made.
 */

export default async function globalTeardown() {
  console.log('✅ Global teardown complete (nothing is reset globally)')
}
