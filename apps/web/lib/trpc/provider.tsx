"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { api, trpcClient as staticClient } from "./client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        logger: {
          log: console.log,
          warn: console.warn,
          // Désactive l'affichage des erreurs dans la console (les UI gèrent l'alerte)
          error: () => {},
        },
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // Réutilise le client tRPC configuré pour éviter d'ajouter des options manquantes (transformer...)
  const [trpcClient] = useState(() => staticClient);

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
