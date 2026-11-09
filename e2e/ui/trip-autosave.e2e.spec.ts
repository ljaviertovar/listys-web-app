import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createCloseTheLoopFixture, createTestClient, loadE2EEnv } from '../helpers'

test.setTimeout(240_000)

async function signIn(page: Page, fixture: { email: string; password: string; sessionId: string }) {
  // Authenticate against real local Supabase; this suite exercises trip behavior,
  // independently of the unchanged sign-in form's hydration and dashboard loading.
  const env = loadE2EEnv()
  let cookies: { name: string; value: string; options: CookieOptions }[] = []
  const auth = createServerClient(env.supabaseUrl, env.publishableKey, {
    cookies: { getAll: () => [], setAll: values => { cookies = values } },
  })
  const result = await auth.auth.signInWithPassword({ email: fixture.email, password: fixture.password })
  if (result.error) throw new Error('Could not sign in to the isolated local fixture')
  const host = new URL(String(test.info().project.use.baseURL ?? env.appUrl)).hostname
  await page.context().addCookies(cookies.map(cookie => ({ name: cookie.name, value: cookie.value,
    domain: host, path: cookie.options.path ?? '/', httpOnly: cookie.options.httpOnly ?? false,
    secure: cookie.options.secure ?? false, sameSite: 'Lax' as const })))
  await page.goto(`/shopping/${fixture.sessionId}`)
  await expect(page.getByTestId('trip-sync-status')).toContainText('Saved', { timeout: 20_000 })
}

async function tripItems(sessionId: string) {
  const response = await createTestClient().from('shopping_session_items').select('*').eq('shopping_session_id', sessionId).order('sort_order')
  if (response.error || !response.data) throw new Error('Could not read local fixture items')
  return response.data
}

const checkbox = (page: Page, id: string) => page.getByTestId(`session-item-${id}`).getByRole('checkbox')
const saved = (page: Page) => expect(page.getByTestId('trip-sync-status')).toContainText('Saved', { timeout: 30_000 })

test('rapid checks stay coherent during a slow save, recover a lost response, and complete after flushing', async ({ page }) => {
  const fixture = await createCloseTheLoopFixture()
  try {
    const admin = createTestClient()
    await admin.from('base_list_items').update({ average_price: 4.25 }).eq('id', fixture.itemId)
    await signIn(page, fixture)
    await page.setViewportSize({ width: 1440, height: 1000 })
    const [milk] = await tripItems(fixture.sessionId)
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    let arrived!: () => void
    const requestStarted = new Promise<void>(resolve => { arrived = resolve })
    const path = `**/api/v2/shopping-session-items/${milk.id}`
    await page.route(path, async route => { arrived(); await gate; await route.continue() }, { times: 1 })
    await checkbox(page, milk.id).click()
    await expect(page.getByTestId('session-summary-card')).toContainText('$4.25')
    await expect(page.getByTestId('nav-active-session')).toContainText('1/2')
    await requestStarted
    await expect(checkbox(page, milk.id)).toBeEnabled()
    await checkbox(page, milk.id).click()
    await expect(page.getByTestId('session-summary-card')).toContainText('$0.00')
    await expect(page.getByTestId('nav-active-session')).toContainText('0/2')
    release()
    await saved(page)
    expect((await tripItems(fixture.sessionId))[0]).toMatchObject({ checked: false, version: 3 })

    // Let the real server/DB commit, then lose only the HTTP response to this browser.
    await page.route(path, async route => { await route.fetch(); await route.abort('connectionreset') }, { times: 1 })
    await checkbox(page, milk.id).click()
    await saved(page)
    expect((await tripItems(fixture.sessionId))[0]).toMatchObject({ checked: true, version: 4 })

    await page.setViewportSize({ width: 1440, height: 1000 })
    await checkbox(page, milk.id).click()
    await page.getByTestId('session-actions-inline').getByRole('button', { name: 'Complete Shopping' }).click()
    await page.getByTestId('complete-session-sheet').getByRole('button', { name: 'Complete Shopping', exact: true }).click()
    await expect.poll(fixture.getSessionStatus, { timeout: 30_000 }).toBe('completed')
    expect((await tripItems(fixture.sessionId))[0].checked).toBe(false)
  } finally { await fixture.cleanup() }
})

test('two phones preserve independent items and reject competing versions atomically', async ({ page, browser }) => {
  const fixture = await createCloseTheLoopFixture()
  let second: BrowserContext | undefined
  try {
    await signIn(page, fixture)
    second = await browser.newContext({ storageState: await page.context().storageState(), baseURL: test.info().project.use.baseURL })
    const phone = await second.newPage()
    await phone.goto(`/shopping/${fixture.sessionId}`)
    await saved(phone)
    const [milk, other] = await tripItems(fixture.sessionId)
    await Promise.all([checkbox(page, milk.id).click(), checkbox(phone, other.id).click()])
    await expect.poll(async () => (await tripItems(fixture.sessionId)).every(item => item.checked), { timeout: 30_000 }).toBe(true)
    // Different quantities ensure both requests would be effective mutations.
    const current = (await tripItems(fixture.sessionId))[0]
    const path = `/api/v2/shopping-session-items/${current.id}`
    const outcomes = await Promise.all([
      page.request.patch(path, { data: { quantity: 2, expected_version: current.version } }),
      phone.request.patch(path, { data: { quantity: 3, expected_version: current.version } }),
    ])
    expect(outcomes.map(response => response.status()).sort()).toEqual([200, 409])
    const rejected = outcomes.find(response => response.status() === 409)!
    expect((await rejected.json()).error.code).toBe('ITEM_VERSION_CONFLICT')
    const late = await page.request.patch(`/api/v1/shopping-session-items/${current.id}`, { data: { checked: false } })
    expect(late.status()).toBe(410)
  } finally { await second?.close(); await fixture.cleanup() }
})

test('an offline phone cannot replay a stale check after the other phone changed it twice', async ({ page, browser }) => {
  const fixture = await createCloseTheLoopFixture()
  let second: BrowserContext | undefined
  try {
    await signIn(page, fixture)
    second = await browser.newContext({ storageState: await page.context().storageState(), baseURL: test.info().project.use.baseURL })
    const phone = await second.newPage()
    await phone.goto(`/shopping/${fixture.sessionId}`)
    await saved(phone)
    const [milk] = await tripItems(fixture.sessionId)
    await page.context().setOffline(true)
    await checkbox(page, milk.id).click()
    await expect(page.getByTestId('trip-sync-status')).toContainText('Not saved')
    await checkbox(phone, milk.id).click()
    await saved(phone)
    await checkbox(phone, milk.id).click()
    await saved(phone)
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    const conflict = page.getByTestId(`trip-item-conflict-${milk.id}`)
    await expect(conflict).toBeVisible()
    await expect(checkbox(page, milk.id)).not.toBeChecked()
    expect((await tripItems(fixture.sessionId))[0]).toMatchObject({ checked: false, version: 3 })
    await conflict.getByRole('button', { name: 'Apply My Change' }).click()
    await saved(page)
    expect((await tripItems(fixture.sessionId))[0]).toMatchObject({ checked: true, version: 4 })
  } finally { await page.context().setOffline(false); await second?.close(); await fixture.cleanup() }
})

test('recovers a pending check after reload and exposes a trip completed on another phone', async ({ page }) => {
  const fixture = await createCloseTheLoopFixture()
  try {
    await signIn(page, fixture)
    const [milk] = await tripItems(fixture.sessionId)
    await page.context().setOffline(true)
    await checkbox(page, milk.id).click()
    expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('listys:trip-checks:v1:')))).toBe(true)
    // Fail this app's save HTTP request; all Supabase traffic remains real.
    await page.route('**/api/v2/shopping-session-items/*', route => route.abort('internetdisconnected'))
    await page.context().setOffline(false)
    await page.reload()
    await expect(checkbox(page, milk.id)).toBeChecked()
    await expect(page.getByTestId('trip-sync-status')).toContainText('Not saved')
    await page.unroute('**/api/v2/shopping-session-items/*')
    await page.getByTestId('trip-sync-status').getByRole('button', { name: 'Retry' }).click()
    await saved(page)
    await page.context().setOffline(true)
    await checkbox(page, milk.id).click()
    // A second request client represents the other device while this page is offline.
    const complete = await page.request.post(`/api/v1/shopping-sessions/${fixture.sessionId}/complete`, { data: {} })
    expect(complete.ok()).toBe(true)
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await expect(page.getByTestId(`trip-item-conflict-${milk.id}`)).toBeVisible()
    expect((await tripItems(fixture.sessionId))[0].checked).toBe(true)
  } finally { await page.context().setOffline(false); await fixture.cleanup() }
})

test('preserves pending work when receipt review cannot flush and retries before attaching', async ({ page }) => {
  const fixture = await createCloseTheLoopFixture()
  try {
    await signIn(page, fixture)
    const [milk] = await tripItems(fixture.sessionId)
    const path = '**/api/v2/shopping-session-items/*'
    await page.route(path, route => route.abort('connectionreset'))
    await checkbox(page, milk.id).click()
    await page.getByRole('button', { name: 'Review Receipt', exact: true }).first().click()
    const dialog = page.getByTestId('attach-to-session-dialog')
    await expect(dialog.getByTestId('attach-review-load-error')).toBeVisible()
    expect((await tripItems(fixture.sessionId))[0].checked).toBe(false)
    await page.unroute(path)
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Attach Receipt', exact: true })).toBeVisible({ timeout: 30_000 })
    expect((await tripItems(fixture.sessionId))[0].checked).toBe(true)
    await dialog.getByRole('button', { name: 'Attach Receipt', exact: true }).click()
    await expect(dialog).not.toBeVisible({ timeout: 30_000 })
    expect(await fixture.getSessionStatus()).toBe('active')
  } finally { await fixture.cleanup() }
})

test('reports pending work when another device deletes the trip', async ({ page }) => {
  const fixture = await createCloseTheLoopFixture()
  try {
    await signIn(page, fixture)
    const [milk] = await tripItems(fixture.sessionId)
    await page.context().setOffline(true)
    await checkbox(page, milk.id).click()
    const deleted = await page.request.delete(`/api/v1/shopping-sessions/${fixture.sessionId}`)
    expect(deleted.ok()).toBe(true)
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await expect(page.getByText('Some changes on this device were not applied.')).toBeVisible()
  } finally { await page.context().setOffline(false); await fixture.cleanup() }
})

test('inspects synchronization feedback on mobile and desktop through Chrome DevTools', async ({ page }) => {
  const fixture = await createCloseTheLoopFixture()
  try {
    await signIn(page, fixture)
    const [milk] = await tripItems(fixture.sessionId)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: test.info().outputPath('trip-saved-mobile.png'), fullPage: true })
    await page.context().setOffline(true)
    await checkbox(page, milk.id).click()
    await expect(page.getByTestId('trip-sync-status')).toContainText('Not saved')
    await page.screenshot({ path: test.info().outputPath('trip-error-mobile.png'), fullPage: true })
    await createTestClient().from('shopping_session_items').update({ quantity: 2 }).eq('id', milk.id)
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await expect(page.getByTestId(`trip-item-conflict-${milk.id}`)).toBeVisible()
    await page.screenshot({ path: test.info().outputPath('trip-conflict-mobile.png'), fullPage: true })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.screenshot({ path: test.info().outputPath('trip-conflict-desktop.png'), fullPage: true })
    const devtools = await page.context().newCDPSession(page)
    await devtools.send('DOM.enable')
    await devtools.send('CSS.enable')
    const { root } = await devtools.send('DOM.getDocument')
    const { nodeId } = await devtools.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-testid="trip-sync-status"]' })
    const [styles, box] = await Promise.all([
      devtools.send('CSS.getComputedStyleForNode', { nodeId }),
      devtools.send('DOM.getBoxModel', { nodeId }),
    ])
    await test.info().attach('synchronization-dom-and-computed-styles', { body: JSON.stringify({ styles, box }), contentType: 'application/json' })
    await devtools.detach()
  } finally { await page.context().setOffline(false); await fixture.cleanup() }
})
