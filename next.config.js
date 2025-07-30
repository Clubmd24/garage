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
  // Enable compression
  compress: true,
};

export default nextConfig;
