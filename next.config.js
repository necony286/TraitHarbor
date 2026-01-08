/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['playwright', 'playwright-core']
};

module.exports = nextConfig;
