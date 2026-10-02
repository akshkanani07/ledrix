import { requireSession } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!session?.user) {
    return null;
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    >
      {children}
    </DashboardShell>
  );
}