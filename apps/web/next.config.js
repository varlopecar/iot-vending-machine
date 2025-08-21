/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  transpilePackages: ["@repo/trpc"],
  
  // Headers de sécurité selon recommandations OWASP
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    const csp = [
      "default-src 'self'",
      // Scripts : plus restrictif en production
      isDev 
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" 
        : "script-src 'self'",
      // Styles : autoriser inline pour Tailwind mais limiter les sources
      "style-src 'self' 'unsafe-inline'",
      // Images : autoriser data URIs et HTTPS uniquement
      "img-src 'self' data: https:",
      // Connexions : backend et services essentiels uniquement
      isDev
        ? "connect-src 'self' http://localhost:3000 https://api.stripe.com ws://localhost:*"
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
