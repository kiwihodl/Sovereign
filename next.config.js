/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'secure.gravatar.com'],
  },
}

module.exports = nextConfig;
