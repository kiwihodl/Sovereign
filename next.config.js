/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'secure.gravatar.com'],
  },
}

module.exports = nextConfig;
