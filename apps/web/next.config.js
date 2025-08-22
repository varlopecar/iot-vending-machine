/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  transpilePackages: ["@repo/trpc"],
  
  // Headers de sécurité selon recommandations OWASP
  async headers() {
    // Ensure we're in development mode for local development
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
    
    console.log('🔧 Next.js Config - Environment:', process.env.NODE_ENV);
    console.log('🔧 Next.js Config - isDev:', isDev);
    
    const csp = [
      "default-src 'self'",
      // Scripts : allow unsafe-inline in development, strict in production
      isDev 
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-UJWDOKXMYa+QbSjE9DZCWwdSE1eavGoUa8q3qVdc+q0=' 'sha256-K6tdVCj0kScFVzdsrVgAQ6DaGekqxnO3T3WBcDC1RXE=' 'sha256-FhLHRUQz4c4ntLU9VkfEesX7PnzNLENSe/16Hi523Kk=' 'sha256-YjZl9+h6dDmERkT7ebobEOfWJEeKh5MDgzcM2RtuBuM=' 'sha256-bg+CWjI8RppcgHYH6RuW4z4OnLAUEUPDXRoYUo9Tyok='" 
        : "script-src 'self'",
      // Styles : autoriser inline pour Tailwind mais limiter les sources
      "style-src 'self' 'unsafe-inline'",
      // Images : autoriser data URIs et HTTPS uniquement
      "img-src 'self' data: https:",
      // Connexions : backend et services essentiels uniquement
      isDev
        ? "connect-src 'self' http://localhost:3000 https://api.stripe.com ws://localhost:* wss://localhost:*"
        : "connect-src 'self' https://your-backend-prod.com https://api.stripe.com",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      ...(isDev ? [] : ["upgrade-insecure-requests"])
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
