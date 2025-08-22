"use client";

import TrpcProvider from "@repo/trpc/TrpcProvider";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const getUrl = () => {
    const base = (() => {
      // Check if we're in production mode
      const isProduction = process.env.NODE_ENV === 'production';

      // Check for explicit API URL environment variable first
      if (process.env.NEXT_PUBLIC_API_URL_PRODUCTION) {
        console.log('🔗 TRPC Provider - Using NEXT_PUBLIC_API_URL_PRODUCTION');
        return process.env.NEXT_PUBLIC_API_URL_PRODUCTION;
      }

      if (typeof window !== "undefined") {
        // In browser, use production URL if in production mode
        if (isProduction) {
          console.log('🔗 TRPC Provider - Using production URL for browser in production mode');
          return "https://iot-vending-machine.osc-fr1.scalingo.io";
        } else {
          console.log('🔗 TRPC Provider - Using localhost:3000 for browser in development mode');
          return "http://localhost:3000";
        }
      }

      // For SSR
      if (process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION) {
        console.log('🔗 TRPC Provider - Using production URL for SSR');
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION}`;
      }

      if (isProduction) {
        console.log('🔗 TRPC Provider - Using production URL for SSR fallback in production');
        return "https://iot-vending-machine.osc-fr1.scalingo.io";
      }

      console.log('🔗 TRPC Provider - Using localhost:3000 for SSR fallback in development');
      return `http://localhost:3000`;
    })();
    const url = `${base}/trpc`;
    console.log('🔗 TRPC Provider - Final URL:', url);
    return url;
  };

  return <TrpcProvider url={getUrl()}>{children}</TrpcProvider>;
}
