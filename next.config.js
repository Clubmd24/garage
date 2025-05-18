/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],    // add any external domains you need for next/image
  },
  experimental: {
    appDir: false,  // only enable if you want to use the /app directory
  },
};

module.exports = nextConfig;
