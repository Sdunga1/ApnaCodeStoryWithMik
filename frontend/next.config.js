/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable App Router
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;

