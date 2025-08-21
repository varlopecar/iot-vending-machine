"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../../packages/globals/trpc/src/server/server";

export const api: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();

export const getUrl = () => {
  const base = (() => {
    if (typeof window !== "undefined") return "http://localhost:3000"; // backend url for browser
    if (process.env.NEXT_PUBLIC_API_URL_PRODUCTION)
      return `${process.env.NEXT_PUBLIC_API_URL_PRODUCTION}`; // SSR should use vercel url
    return `http://localhost:3000`; // Backend runs on port 3000
  })();
  return `${base}/trpc`;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getUrl(),
      // You can pass any HTTP headers you wish here
      async headers() {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("admin_token")
            : null;
        return {
          ...(token && { authorization: `Bearer ${token}` }),
        };
      },
    }),
  ],
});
