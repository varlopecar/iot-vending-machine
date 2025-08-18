"use client";

import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthProvider } from "@/contexts/auth-context";
import { AdminLogin } from "@/components/auth/admin-login";

export default function LoginPage() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <AdminLogin />
      </AuthProvider>
    </TRPCProvider>
  );
}
