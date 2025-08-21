import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "VendingAdmin - Back-office",
  description: "Interface d'administration pour les machines de distribution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}