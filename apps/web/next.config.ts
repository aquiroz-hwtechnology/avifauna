import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https:\/\/static\.inaturalist\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'inaturalist-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https:\/\/avifaunastorage\.blob\.core\.windows\.net\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sighting-photos',
        expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
      },
    },
    {
      urlPattern: /\/api\/(species|sightings).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-data',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(js|css|woff2?)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'static.inaturalist.org' },
      { protocol: 'https', hostname: '*.ebird.org' },
      { protocol: 'https', hostname: 'avifaunastorage.blob.core.windows.net' },
    ],
  },
}

export default withPWA(nextConfig)
