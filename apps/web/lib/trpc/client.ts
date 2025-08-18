"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../../packages/globals/trpc/src/server/server";

export const api = createTRPCReact<AppRouter>();

export const getUrl = () => {
  const base = (() => {
    if (typeof window !== "undefined") return "http://localhost:3000"; // backend url for browser
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:3000`; // Backend runs on port 3000
  })();
  return `${base}/trpc`;
};
