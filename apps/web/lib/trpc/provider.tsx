"use client";

import TrpcProvider from "@repo/trpc/TrpcProvider";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const getUrl = () => {
    const base = (() => {
      if (typeof window !== "undefined") {
        // In browser, use localhost for development
        console.log('🔗 TRPC Provider - Using localhost:3000 for browser');
        return "http://localhost:3000";
      }
      if (process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION) {
        console.log('🔗 TRPC Provider - Using production URL for SSR');
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION}`;
      }
      console.log('🔗 TRPC Provider - Using localhost:3000 for SSR fallback');
      return `http://localhost:3000`;
    })();
    const url = `${base}/trpc`;
    console.log('🔗 TRPC Provider - Final URL:', url);
    return url;
  };

  return <TrpcProvider url={getUrl()}>{children}</TrpcProvider>;
}
