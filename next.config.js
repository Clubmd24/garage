/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],  // add any image hostnames here
    unoptimized: true, // for static export compatibility
  },
  // Disable static generation for problematic pages
  trailingSlash: false,
  // Enable compression
  compress: true,
  // Ensure proper asset handling
  assetPrefix: '',
};

export default nextConfig;
