const removeImports = require("next-remove-imports")();

module.exports = removeImports({
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'secure.gravatar.com', 'plebdevs-three.vercel.app'],
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
        source: "/.well-known/nostr.json",
        destination: "/api/nip05",
      },
      {
        source: '/.well-known/lnurlp/:slug',
        destination: '/api/lightning-address/lnurlp/:slug',
      }
    ];
  },
});