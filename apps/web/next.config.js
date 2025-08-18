/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move turbo config to turbopack as recommended
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  transpilePackages: [],

  // Vercel deployment optimizations
  output: 'standalone',

  // Disable static optimization for error pages to prevent context issues
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Environment variable validation
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },

  // Security headers (additional to vercel.json)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
