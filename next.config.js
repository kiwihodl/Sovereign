/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
      { protocol: 'https', hostname: 'plebdevs-three.vercel.app' },
      { protocol: 'https', hostname: 'plebdevs.com' },
      { protocol: 'https', hostname: 'plebdevs-bucket.nyc3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'i.nostr.build' },
    ],
  },
  webpack(config, options) {
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/cron',
        destination: '/api/cron',
      },
      {
        source: '/.well-known/nostr.json',
        destination: '/api/nip05',
      },
      {
        source: '/.well-known/lnurlp/:slug',
        destination: '/api/lightning-address/lnurlp/:slug',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data: https://authjs.dev cdn.shopify.com pbs.twimg.com cdn.discordapp.com i.nostr.build secure.gravatar.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; connect-src 'self' https://vitals.vercel-insights.com sovereign-university.myshopify.com wss://nos.lol wss://relay.damus.io wss://relay.snort.social wss://relay.nostr.band wss://relay.primal.net wss://nostrue.com wss://purplerelay.com wss://relay.devs.tools wss://*.nostr.com wss://*.nostr.band;",
          },
        ],
      },
      {
        source: '/api/:slug*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.BACKEND_URL,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  env: {
    KV_URL: process.env.NODE_ENV !== 'production' ? process.env.REDIS_URL : process.env.KV_URL,
    KV_REST_API_URL:
      process.env.NODE_ENV !== 'production' ? process.env.REDIS_URL : process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN:
      process.env.NODE_ENV !== 'production' ? 'dummy_token' : process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN:
      process.env.NODE_ENV !== 'production'
        ? 'dummy_token'
        : process.env.KV_REST_API_READ_ONLY_TOKEN,
  },
};

module.exports = nextConfig;
