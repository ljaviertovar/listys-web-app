const SW_VERSION = 'v1'
const SHELL_CACHE = `listys-shell-${SW_VERSION}`
const ASSET_CACHE = `listys-assets-${SW_VERSION}`
const PRECACHE_URLS = ['/', '/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request))
    return
  }

  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/auth/')) return
  if (url.pathname.startsWith('/storage/')) return
  if (url.pathname.includes('supabase')) return

  const staticAsset =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/i.test(url.pathname)

  if (staticAsset) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

async function networkFirstNavigate(request) {
  try {
    return await fetch(request)
  } catch {
    const offlineResponse = await caches.match('/offline.html')
    return offlineResponse || Response.error()
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone())
      return networkResponse
    })
    .catch(() => undefined)

  return cachedResponse || fetchPromise || Response.error()
}
