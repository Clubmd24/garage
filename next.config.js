/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],  // add any image hostnames here
    unoptimized: true, // for static export compatibility
  },
  // Disable static generation for problematic pages
  trailingSlash: false,
  // Ensure proper build output
  output: 'standalone',
  // Enable build cache for faster rebuilds
  experimental: {
    // Enable build cache
    buildCache: true,
    // Optimize for production
    optimizeCss: true,
    // Enable SWC minification
    swcMinify: true,
  },
  // Configure build optimization
  swcMinify: true,
  // Enable compression
  compress: true,
};

export default nextConfig;
