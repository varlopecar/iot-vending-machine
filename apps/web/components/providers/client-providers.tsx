"use client";

import { ReactNode, useEffect, useState } from "react";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MainLayout } from "@/components/layout";

interface ClientProvidersProps {
    children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <TRPCProvider>
            <AuthProvider>
                <AuthGuard>
                    <MainLayout>{children}</MainLayout>
                </AuthGuard>
            </AuthProvider>
        </TRPCProvider>
    );
}
