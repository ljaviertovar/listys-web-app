import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Listys - Smart Shopping List Manager',
    short_name: 'Listys',
    description: 'Manage your shopping lists with AI-powered receipt processing',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // The page ground (bg-muted), so the splash the system draws and AppLoading share one colour instead of flashing white to grey.
    background_color: '#f3f3f0',
    theme_color: '#15171b',
    lang: 'en-US',
    icons: [
      {
        src: '/icons/pwa/android/android-launchericon-192-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/pwa/android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/pwa/android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
