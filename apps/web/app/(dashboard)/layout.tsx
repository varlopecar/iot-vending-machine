import { ClientProviders } from "@/components/providers/client-providers";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ClientProviders>{children}</ClientProviders>;
}
