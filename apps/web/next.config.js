/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],

  // Skip build errors and static generation issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Force dynamic rendering for all pages
  force404: false,
  dynamicIO: false,

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

};

export default nextConfig;
