"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { api, trpcClient as staticClient } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => staticClient);
  const [mounted, setMounted] = useState(isBrowser);

  useEffect(() => {
    if (isBrowser) {
      setMounted(true);
    }
  }, [isBrowser]);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
