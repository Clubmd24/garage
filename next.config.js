/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],  // add any image hostnames here
    unoptimized: true, // for static export compatibility
  },
  // Handle static generation better
  trailingSlash: false,
  // Ensure proper build output
  output: 'standalone',
};

export default nextConfig;
