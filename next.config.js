/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['amazonaws.com'], // allow S3 bucket images
  }
};

export default nextConfig;
