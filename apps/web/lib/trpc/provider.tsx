"use client";

import TrpcProvider from "@repo/trpc/TrpcProvider";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const getUrl = () => {
    const base = (() => {
      if (typeof window !== "undefined") return "http://localhost:3000"; // backend url for browser
      if (process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION)
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL_PRODUCTION}`; // SSR should use vercel url
      return `http://localhost:3000`; // Backend runs on port 3000
    })();
    return `${base}/trpc`;
  };

  return <TrpcProvider url={getUrl()}>{children}</TrpcProvider>;
}
