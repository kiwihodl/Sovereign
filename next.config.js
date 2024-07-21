// next.config.js
const removeImports = require("next-remove-imports")();

module.exports = removeImports({
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'secure.gravatar.com'],
  },
  webpack(config, options) {
    return config;
  },
});